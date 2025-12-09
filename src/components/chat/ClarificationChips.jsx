import React from 'react';

const ClarificationChips = ({ missingFields, onAction }) => {
    if (!missingFields || missingFields.length === 0) return null;

    const suggestions = missingFields.map(field => {
        if (field === 'destination') return { label: "Set destination to China", value: "Set destination to China" };
        if (field === 'eccn') return { label: "My product is ECCN 5A002", value: "The ECCN is 5A002" };
        if (field === 'value') return { label: "Value is $5,000", value: "Value is $5000" };
        if (field === 'end_user_name') return { label: "End User is Huawei", value: "The end user is Huawei" };
        return { label: `Set ${field}`, value: `The ${field} is ...` };
    });

    return (
        <div className="flex flex-wrap gap-2 mt-3 animate-fade-in">
            {suggestions.map((s, i) => (
                <button
                    key={i}
                    onClick={() => onAction(s.value)}
                    className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs font-medium border border-blue-100 hover:bg-blue-100 transition-colors"
                >
                    {s.label}
                </button>
            ))}
        </div>
    );
};

export default ClarificationChips;
