"use client";

import React, { useState } from 'react';
import { parse } from 'papaparse';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { GripVertical } from "lucide-react";

const Dashboard = () => {
const [data, setData] = useState([]);
const [columns, setColumns] = useState([]);
const [cards, setCards] = useState([]);
const [markdownContent, setMarkdownContent] = useState('');

const handleFileUpload = (event) => {
const file = event.target.files[0];
if (file) {
    parse(file, {
    header: true,
    complete: (results) => {
        setData(results.data);
        setColumns(Object.keys(results.data[0]));
    }
    });
}
};

const addMarkdownCard = () => {
setCards([...cards, {
    type: 'markdown',
    content: markdownContent,
    id: `card-${cards.length}`
}]);
setMarkdownContent('');
};

const addChartCard = (xAxis, yAxis) => {
setCards([...cards, {
    type: 'chart',
    xAxis,
    yAxis,
    id: `card-${cards.length}`
}]);
};

const downloadDashboard = () => {
const dashboardHTML = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Dashboard Export</title>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/recharts/2.12.3/Recharts.js"></script>
        <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    </head>
    <body>
        <div id="root">
        <div class="p-8">
            ${cards.map(card => {
            if (card.type === 'markdown') {
                return `
                <div class="bg-white p-6 rounded-lg shadow-lg mb-6">
                    ${card.content}
                </div>
                `;
            } else {
                return `
                <div class="bg-white p-6 rounded-lg shadow-lg mb-6">
                    <div style="height: 300px;">
                    <!-- Chart placeholder -->
                    <div id="${card.id}"></div>
                    </div>
                </div>
                `;
            }
            }).join('')}
        </div>
        </div>
        <script>
        const data = ${JSON.stringify(data)};
        // Initialize charts here
        </script>
    </body>
    </html>
`;

const blob = new Blob([dashboardHTML], { type: 'text/html' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'dashboard.html';
a.click();
URL.revokeObjectURL(url);
};

return (
<div className="p-8">
    <div className="mb-8">
    <input
        type="file"
        accept=".csv"
        onChange={handleFileUpload}
        className="mb-4 block"
    />
    
    {data.length > 0 && (
        <div className="space-y-4">
        <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Add Markdown Card</h3>
            <textarea
            value={markdownContent}
            onChange={(e) => setMarkdownContent(e.target.value)}
            className="w-full h-32 p-2 border rounded"
            placeholder="Enter markdown content..."
            />
            <Button 
            onClick={addMarkdownCard}
            className="mt-2"
            >
            Add Markdown Card
            </Button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Add Chart Card</h3>
            <div className="grid grid-cols-2 gap-4">
            <select className="p-2 border rounded">
                {columns.map(col => (
                <option key={col} value={col}>{col}</option>
                ))}
            </select>
            <select className="p-2 border rounded">
                {columns.map(col => (
                <option key={col} value={col}>{col}</option>
                ))}
            </select>
            </div>
            <Button 
            onClick={() => addChartCard(columns[0], columns[1])}
            className="mt-2"
            >
            Add Chart Card
            </Button>
        </div>
        </div>
    )}
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {cards.map(card => (
        <Card key={card.id} className="relative">
        <div className="absolute top-2 right-2 cursor-move">
            <GripVertical size={20} />
        </div>
        <CardHeader>
            <CardTitle>{card.type === 'markdown' ? 'Text Card' : 'Chart Card'}</CardTitle>
        </CardHeader>
        <CardContent>
            {card.type === 'markdown' ? (
            <div>{card.content}</div>
            ) : (
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={card.xAxis} />
                    <YAxis dataKey={card.yAxis} />
                    <Tooltip />
                    <Line 
                    type="monotone" 
                    dataKey={card.yAxis} 
                    stroke="#8884d8" 
                    />
                </LineChart>
                </ResponsiveContainer>
            </div>
            )}
        </CardContent>
        </Card>
    ))}
    </div>

    {cards.length > 0 && (
    <Button 
        onClick={downloadDashboard}
        className="mt-8"
    >
        Download Dashboard
    </Button>
    )}
</div>
);
};

export default Dashboard;