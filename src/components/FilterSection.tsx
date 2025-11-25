import { useState } from 'react'

type FilterOption = {
    id: string
    label: string
    count: number
}

type FilterSectionProps = {
    title: string
    options: FilterOption[]
    selected: string[]
    onToggle: (id: string) => void
    onClear: () => void
}

export function FilterSection({
    title,
    options,
    selected,
    onToggle,
    onClear
}: FilterSectionProps) {
    const [isExpanded, setIsExpanded] = useState(true)

    const hasSelections = selected.length > 0

    return (
        <div className="filter-section">
            <button
                className="filter-section-header"
                onClick={() => setIsExpanded(!isExpanded)}
                aria-expanded={isExpanded}
            >
                <span className="filter-section-icon">{isExpanded ? '▼' : '▶'}</span>
                <span className="filter-section-title">{title}</span>
            </button>

            {isExpanded && (
                <div className="filter-section-content">
                    <ul className="filter-options">
                        {options.map((option) => {
                            const isSelected = selected.includes(option.id)
                            return (
                                <li key={option.id} className="filter-option">
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => onToggle(option.id)}
                                        />
                                        <span className="filter-option-label">
                                            {option.label} ({option.count})
                                        </span>
                                    </label>
                                </li>
                            )
                        })}
                    </ul>

                    {hasSelections && (
                        <button className="filter-clear-btn" onClick={onClear}>
                            Clear
                        </button>
                    )}
                </div>
            )}
        </div>
    )
}
