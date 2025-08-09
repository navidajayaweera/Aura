
import React, { useState, useEffect } from 'react';
import { Message, ChecklistCategory } from '../types';
import { ShoppingCartIcon, ClothIcon, ElectronicsIcon, SuggestionsIcon, WeatherIcon, DefaultIcon } from './icons';

const getCategoryIcon = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('grocer')) return <ShoppingCartIcon />;
    if (cat.includes('cloth')) return <ClothIcon />;
    if (cat.includes('electronic')) return <ElectronicsIcon />;
    if (cat.includes('suggest')) return <SuggestionsIcon />;
    if (cat.includes('weather')) return <WeatherIcon />;
    return <DefaultIcon />;
};

interface CheckableItem {
    text: string;
    checked: boolean;
}

const ChecklistSection: React.FC<{
    title: string;
    items: CheckableItem[];
    categoryForIcon: string;
    onToggleItem: (index: number) => void;
}> = ({ title, items, categoryForIcon, onToggleItem }) => {
    if (!items || items.length === 0) return null;

    return (
        <div className="mt-4">
            <h3 className="text-lg font-semibold flex items-center text-gray-200 mb-2">
                {getCategoryIcon(categoryForIcon)}
                {title}
            </h3>
            <ul className="space-y-2 text-gray-300">
                {items.map((item, index) => (
                    <li key={index}>
                        <label className="flex items-center cursor-pointer group p-2 rounded-md hover:bg-gray-700/50 transition-colors">
                            <input
                                type="checkbox"
                                checked={item.checked}
                                onChange={() => onToggleItem(index)}
                                className="h-5 w-5 rounded-sm bg-gray-600 border-gray-500 text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-800 mr-4 shrink-0"
                                aria-label={item.text}
                            />
                            <span className={`transition-all duration-200 ${item.checked ? 'line-through text-gray-500' : 'text-gray-300 group-hover:text-white'}`}>
                                {item.text}
                            </span>
                        </label>
                    </li>
                ))}
            </ul>
        </div>
    );
};

interface ChecklistState {
    greeting: string;
    weather: {
        summary: string;
        temperature: string;
        items: CheckableItem[];
    };
    checklist: (Omit<ChecklistCategory, 'items'> & { items: CheckableItem[] })[];
    suggestions: CheckableItem[];
    closing: string;
}

const AuraResponseCard: React.FC<{ data: Message['data'] }> = ({ data }) => {
    const [checklistData, setChecklistData] = useState<ChecklistState | null>(null);

    useEffect(() => {
        if (data) {
            const initialState: ChecklistState = {
                greeting: data.greeting,
                weather: {
                    summary: data.weather.summary,
                    temperature: data.weather.temperature,
                    items: data.weather.items.map(text => ({ text, checked: false })),
                },
                checklist: data.checklist.map(category => ({
                    ...category,
                    items: category.items.map(text => ({ text, checked: false })),
                })),
                suggestions: data.suggestions.map(text => ({ text, checked: false })),
                closing: data.closing,
            };
            setChecklistData(initialState);
        }
    }, [data]);

    const handleToggleWeatherItem = (index: number) => {
        setChecklistData(prev => {
            if (!prev) return null;
            const newItems = [...prev.weather.items];
            newItems[index] = { ...newItems[index], checked: !newItems[index].checked };
            return { ...prev, weather: { ...prev.weather, items: newItems } };
        });
    };

    const handleToggleChecklistItem = (categoryIndex: number, itemIndex: number) => {
        setChecklistData(prev => {
            if (!prev) return null;
            const newChecklist = [...prev.checklist];
            const categoryToUpdate = { ...newChecklist[categoryIndex] };
            const newItems = [...categoryToUpdate.items];
            newItems[itemIndex] = { ...newItems[itemIndex], checked: !newItems[itemIndex].checked };
            categoryToUpdate.items = newItems;
            newChecklist[categoryIndex] = categoryToUpdate;
            return { ...prev, checklist: newChecklist };
        });
    };

    const handleToggleSuggestionItem = (index: number) => {
        setChecklistData(prev => {
            if (!prev) return null;
            const newItems = [...prev.suggestions];
            newItems[index] = { ...newItems[index], checked: !newItems[index].checked };
            return { ...prev, suggestions: newItems };
        });
    };

    if (!checklistData) {
        return null;
    }

    const { greeting, weather, checklist, suggestions, closing } = checklistData;

    return (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
            <p className="text-gray-200 mb-4">{greeting}</p>

            {(weather.summary || weather.temperature) && (
                <div className="mb-4 p-3 bg-gray-700/50 rounded-lg flex items-center justify-between gap-4">
                    {weather.summary && <p className="text-gray-300 italic flex-grow">"{weather.summary}"</p>}
                    {weather.temperature && <span className="text-2xl font-bold text-sky-300 flex-shrink-0">{weather.temperature}</span>}
                </div>
            )}
            
            <ChecklistSection
                title="Weather Essentials"
                items={weather.items}
                categoryForIcon="weather"
                onToggleItem={handleToggleWeatherItem}
            />

            {checklist.map((category, catIndex) => (
                <ChecklistSection
                    key={category.category}
                    title={category.category}
                    items={category.items}
                    categoryForIcon={category.category}
                    onToggleItem={(itemIndex) => handleToggleChecklistItem(catIndex, itemIndex)}
                />
            ))}
            
            <ChecklistSection
                title="Suggested Items"
                items={suggestions}
                categoryForIcon="suggestions"
                onToggleItem={handleToggleSuggestionItem}
            />

            <p className="text-gray-200 mt-6">{closing}</p>
        </div>
    );
};


const ChatMessage: React.FC<{ message: Message }> = ({ message }) => {
    const isUser = message.sender === 'user';

    return (
        <div className={`flex items-start gap-4 my-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
            {!isUser && (
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex-shrink-0 shadow-lg"></div>
            )}
            <div className={`max-w-xl rounded-xl px-5 py-3 shadow-md ${isUser ? 'bg-blue-600 text-white' : 'bg-gray-700 text-white'}`}>
                {message.data ? (
                    <AuraResponseCard data={message.data} />
                ) : (
                    <p>{message.text}</p>
                )}
            </div>
        </div>
    );
};

export default ChatMessage;
