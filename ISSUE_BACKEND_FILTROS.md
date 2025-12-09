# Issue: Filtros de Cuisine y Course no funcionan correctamente

## Problema Descrito

Los filtros de `cuisine` y `course` en el endpoint `/search/recipes` no están funcionando correctamente:

1. **Filtro de Cuisine (`cuisine`)**: 
   - Cuando se aplica un filtro de cocina (ej: "Asiatico"), el backend devuelve 0 resultados
   - Sin embargo, el frontend muestra que hay recetas disponibles con ese valor de cuisine
   - Ejemplo: muestra "Asiatico (1)" en los filtros, pero al seleccionarlo, no devuelve ninguna receta

2. **Filtro de Course (`course`)**:
   - El filtro no tiene ningún efecto - las recetas se mantienen igual independientemente del filtro seleccionado
   - No se aplica ningún filtrado por course

## Información del Frontend

### Parámetros que se están enviando:

El frontend envía los parámetros de la siguiente manera:

```
GET /search/recipes?cuisine=Asiatico&size=50
GET /search/recipes?course=Principal&size=50
```

**Nota importante**: Según la documentación `FILTROS_API.md`, los filtros `cuisine` y `course` son de tipo `String` (no `String/Array`), por lo que el frontend envía solo el primer valor seleccionado, no múltiples valores separados por comas.

### Estructura de datos esperada:

Las recetas tienen los siguientes campos según el tipo `Recipe`:

```typescript
{
  _id: string
  title: string
  cuisine?: string  // Ejemplos: "Italiana", "Española", "Asiatico", "Mediterranea"
  course?: string    // Ejemplos: "Principal", "Entrante", "Postre", "Sopa"
  // ... otros campos
}
```

### Ejemplo de receta en la base de datos:

Según `es_dump.json`, una receta tiene esta estructura:

```json
{
  "_source": {
    "cuisine": "Italiana",
    "course": "Entrante",
    "title": "Ensalada verde estilo caprese",
    // ...
  }
}
```

## Lo que el Frontend espera recibir:

### Respuesta exitosa de Elasticsearch:

```json
{
  "hits": {
    "total": {
      "value": 1,
      "relation": "eq"
    },
    "hits": [
      {
        "_id": "691f260b9d2ada464e40a586",
        "_source": {
          "cuisine": "Italiana",
          "course": "Entrante",
          "title": "...",
          // ... resto de campos
        }
      }
    ]
  }
}
```

## Puntos a verificar en el Backend:

### 1. ¿Se están recibiendo los parámetros correctamente?

Verificar en el código del endpoint `/search/recipes`:
- ¿Se está leyendo el parámetro `cuisine` de `req.query`?
- ¿Se está leyendo el parámetro `course` de `req.query`?
- ¿Los valores llegan como strings simples o como arrays?

**Ejemplo de lo que debería recibirse:**
```javascript
// req.query debería contener:
{
  cuisine: "Asiatico",  // string, no array
  course: "Principal",  // string, no array
  size: "50"
}
```

### 2. ¿Cómo se está aplicando el filtro en Elasticsearch?

Verificar la query de Elasticsearch:

**Para cuisine:**
- ¿Se está usando un `match`, `term`, o `match_phrase`?
- ¿El campo `cuisine` está mapeado correctamente en el índice?
- ¿Se está aplicando case-insensitive matching? (según la doc, debería ser case-insensitive)

**Para course:**
- Mismas preguntas que para cuisine

### 3. Ejemplo de query Elasticsearch esperada:

```javascript
// Ejemplo de cómo debería construirse la query
const mustClauses = [];

if (req.query.cuisine) {
  mustClauses.push({
    match: {
      cuisine: {
        query: req.query.cuisine,
        operator: 'and'
      }
    }
  });
  // O si es case-insensitive:
  // mustClauses.push({
  //   regexp: {
  //     cuisine: {
  //       value: `.*${req.query.cuisine}.*`,
  //       flags: "ALL",
  //       case_insensitive: true
  //     }
  //   }
  // });
}

if (req.query.course) {
  mustClauses.push({
    match: {
      course: {
        query: req.query.course,
        operator: 'and'
      }
    }
  });
}

const query = {
  bool: {
    must: mustClauses
  }
};
```

### 4. Verificar el mapeo del índice en Elasticsearch:

Verificar que los campos `cuisine` y `course` estén mapeados correctamente:

```bash
# Verificar el mapeo del índice
GET /recipes/_mapping

# Debería mostrar algo como:
{
  "recipes": {
    "mappings": {
      "properties": {
        "cuisine": {
          "type": "text"  // o "keyword" dependiendo de cómo se quiera buscar
        },
        "course": {
          "type": "text"  // o "keyword"
        }
      }
    }
  }
}
```

**Nota importante**: 
- Si el tipo es `keyword`, usar `term` query
- Si el tipo es `text`, usar `match` query
- Si necesitas case-insensitive, usar `match` con `case_insensitive: true` o `regexp`

### 5. Verificar valores exactos en la base de datos:

Ejecutar una búsqueda para ver qué valores exactos hay:

```javascript
// Buscar todas las cuisines únicas
GET /recipes/_search
{
  "size": 0,
  "aggs": {
    "unique_cuisines": {
      "terms": {
        "field": "cuisine.keyword",  // o "cuisine" si es keyword
        "size": 100
      }
    },
    "unique_courses": {
      "terms": {
        "field": "course.keyword",  // o "course" si es keyword
        "size": 100
      }
    }
  }
}
```

Esto mostrará los valores exactos almacenados y ayudará a identificar si hay problemas de:
- Mayúsculas/minúsculas
- Espacios adicionales
- Acentos o caracteres especiales
- Valores nulos o undefined

## Casos de prueba sugeridos:

### Test 1: Filtro de Cuisine básico
```bash
# Debería devolver recetas con cuisine "Italiana"
GET /search/recipes?cuisine=Italiana&size=10
```

### Test 2: Filtro de Course básico
```bash
# Debería devolver recetas con course "Principal"
GET /search/recipes?course=Principal&size=10
```

### Test 3: Filtros combinados
```bash
# Debería devolver recetas italianas que sean platos principales
GET /search/recipes?cuisine=Italiana&course=Principal&size=10
```

### Test 4: Case-insensitive
```bash
# Debería funcionar igual que el Test 1
GET /search/recipes?cuisine=italiana&size=10
GET /search/recipes?cuisine=ITALIANA&size=10
```

## Información adicional:

### Documentación de referencia:
- Ver archivo `FILTROS_API.md` en el repositorio del backend
- Según la documentación:
  - Los filtros `cuisine` y `course` son **case-insensitive**
  - Son de tipo `String` (no `String/Array`)
  - Deben funcionar tanto en `/recipes` (MongoDB) como en `/search/recipes` (Elasticsearch)

### Logs del Frontend (para referencia):

Cuando el frontend aplica un filtro, muestra en consola:
```
🔍 Fetching recipes from: http://localhost:3000/search/recipes?cuisine=Asiatico&size=50
📋 Selected filters: { cuisines: ["Asiatico"], courses: [], ... }
📥 API Response: { total: 0, ... }  // ← Aquí está el problema: devuelve 0 resultados
```

## Checklist para el desarrollador del backend:

- [ ] Verificar que `req.query.cuisine` y `req.query.course` se están leyendo correctamente
- [ ] Verificar que los valores no están siendo modificados antes de usarse en la query
- [ ] Verificar el mapeo de los campos en Elasticsearch (`cuisine` y `course`)
- [ ] Verificar que la query de Elasticsearch incluye los filtros correctamente
- [ ] Verificar que el filtro es case-insensitive (según la documentación)
- [ ] Probar con valores exactos que existen en la base de datos
- [ ] Verificar que no hay problemas con espacios, acentos o caracteres especiales
- [ ] Comparar con cómo funcionan otros filtros (ej: `difficulty`, `ingredients`) que sí funcionan

## Resultado esperado:

Después de arreglar el problema:
- Al filtrar por `cuisine=Asiatico`, debería devolver todas las recetas con ese valor de cuisine
- Al filtrar por `course=Principal`, debería devolver todas las recetas con ese valor de course
- Los filtros deberían funcionar de forma case-insensitive
- Los filtros deberían poder combinarse entre sí y con otros filtros

---

**Prioridad**: Alta - Los filtros son una funcionalidad core de la aplicación y actualmente no funcionan.

**Contacto**: Si necesitas más información o logs específicos del frontend, avísame y puedo proporcionarlos.

