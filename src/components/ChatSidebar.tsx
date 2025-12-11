import { useState, useEffect, useRef, type FormEvent } from 'react'
import casolaImg from '../assets/casola.png'
import usuarioImg from '../assets/usuario.png'

type ChatMessage = {
  from: 'user' | 'assistant'
  text: string
}

export function ChatSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)

  const chatBodyRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
      const el = chatBodyRef.current
      if (!el) return
      el.scrollTop = el.scrollHeight
    }, [messages, loading])


  const toggleOpen = () => {
    setIsOpen((prev) => !prev)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const trimmed = message.trim()
    if (!trimmed) return

    // Afegim el missatge de l'usuari
    setMessages((prev) => [...prev, { from: 'user', text: trimmed }])
    setMessage('')
    setLoading(true)

    try {
      const res = await fetch('http://localhost:3000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed })
      })

      const data = await res.json()

      if (res.ok) {
        setMessages((prev) => [
          ...prev,
          { from: 'assistant', text: data.answer }
        ])
      } else {
        setMessages((prev) => [
          ...prev,
          { from: 'assistant', text: 'Ha ocurrido un error en el servidor.' }
        ])
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { from: 'assistant', text: 'No puedo contactar con el servidor.' }
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Botó flotant només quan està tancat */}
      {!isOpen && (
        <button
          className="chat-toggle"
          type="button"
          onClick={toggleOpen}
          aria-label="Abrir chat"
        >
          Chat
        </button>
      )}

      {/* Panel lateral */}
      <aside
        id="chat-panel"
        className={`chat-panel ${isOpen ? 'open' : ''}`}
        aria-hidden={!isOpen}
      >
        <header className="chat-header">
          <h2>Chat</h2>
          <button
            type="button"
            className="chat-close"
            onClick={toggleOpen}
            aria-label="Cerrar chat"
          >
            ×
          </button>
        </header>

        <div className="chat-body" ref={chatBodyRef}>
          {messages.length === 0 && !loading ? (
            <p className="chat-empty">Todavía no hay mensajes.</p>
          ) : (
            <ul className="chat-messages">
              {messages.map((msg, index) => (
                <li
                  key={index}
                  className={`chat-message-wrapper ${msg.from === 'user' ? 'user-wrapper' : 'assistant-wrapper'
                    }`}
                >
                  {/* Avatar d'usuari / assistent */}
                  {msg.from === 'assistant' && (
                    <img
                      src={casolaImg}
                      alt="assistant"
                      className="chat-avatar"
                    />
                  )}

                  {msg.from === 'user' && (
                    <img
                      src={usuarioImg}
                      alt="user"
                      className="chat-avatar"
                    />
                  )}

                  <div
                    className={`chat-message ${
                      msg.from === 'user' ? 'user-msg' : 'assistant-msg'}`}
                      style={{ whiteSpace: 'pre-wrap' }}
                  >
                    {msg.text}
                  </div>
                </li>
              ))}

              {loading && (
                <li className="chat-message-wrapper assistant-wrapper">
                  <img
                    src={casolaImg}
                    alt="assistant"
                    className="chat-avatar"
                  />
                  <div className="chat-message assistant-msg">
                    Pensando...
                  </div>
                </li>
              )}
            </ul>
          )}
        </div>

        <form className="chat-footer" onSubmit={handleSubmit}>
          <textarea
            className="chat-input"
            placeholder="Escribe aquí..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button type="submit" className="chat-send" disabled={loading || !message.trim()}>
            Enviar
          </button>
        </form>
      </aside>
    </>
  )
}
