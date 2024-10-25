import React, { useState, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ScatterChart, Scatter } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { FileText, Plus, GripHorizontal, X, Type, BarChart, Eye, Edit } from 'lucide-react';

const DashboardBuilder = () => {
const [data, setData] = useState([]);
const [columns, setColumns] = useState([]);
const [blocks, setBlocks] = useState([]);
const [draggedBlock, setDraggedBlock] = useState(null);
const [editingText, setEditingText] = useState(null);

// Handle CSV file upload
const handleFileUpload = (event) => {
const file = event.target.files[0];
const reader = new FileReader();

reader.onload = (e) => {
    const text = e.target.result;
    const lines = text.split('\n');
    const headers = lines[0].split(',').map(header => header.trim());
    
    const parsedData = lines.slice(1)
    .filter(line => line.trim())
    .map(line => {
        const values = line.split(',');
        const row = {};
        headers.forEach((header, index) => {
        row[header] = Number(values[index]) || values[index];
        });
        return row;
    });

    setData(parsedData);
    setColumns(headers);
};

reader.readAsText(file);
};

// Add new block
const addBlock = (type) => {
const newBlock = {
    id: Date.now(),
    type,
    content: type === 'text' ? 'Put your markdown here...' : {
    chartType: 'line',
    xAxis: columns[0] || '',
    yAxis: columns[1] || '',
    },
    isEditing: type === 'text'
};
setBlocks([...blocks, newBlock]);
};

// Handle block drag and drop
const handleDragStart = (blockId) => {
setDraggedBlock(blockId);
};

const handleDragOver = (e, blockId) => {
e.preventDefault();
if (!draggedBlock || draggedBlock === blockId) return;

const blocksCopy = [...blocks];
const draggedIdx = blocksCopy.findIndex(b => b.id === draggedBlock);
const targetIdx = blocksCopy.findIndex(b => b.id === blockId);

const [draggedItem] = blocksCopy.splice(draggedIdx, 1);
blocksCopy.splice(targetIdx, 0, draggedItem);

setBlocks(blocksCopy);
};

// Render chart block
const renderChart = (block) => {
if (!data.length) return null;

const chartProps = {
    width: 600,
    height: 400,
    data: data,
    margin: { top: 20, right: 30, left: 20, bottom: 30 }
};

if (block.content.chartType === 'line') {
    return (
    <LineChart {...chartProps}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={block.content.xAxis} />
        <YAxis dataKey={block.content.yAxis} />
        <Tooltip />
        <Line type="monotone" dataKey={block.content.yAxis} stroke="#8884d8" />
    </LineChart>
    );
} else {
    return (
    <ScatterChart {...chartProps}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={block.content.xAxis} />
        <YAxis dataKey={block.content.yAxis} />
        <Tooltip />
        <Scatter data={data} fill="#8884d8" />
    </ScatterChart>
    );
}
};

// Toggle text block edit mode
const toggleEditMode = (blockId) => {
setBlocks(blocks.map(block => 
    block.id === blockId 
    ? { ...block, isEditing: !block.isEditing }
    : block
));
};

// Update block content
const updateBlockContent = (blockId, newContent) => {
setBlocks(blocks.map(block => 
    block.id === blockId ? { ...block, content: newContent } : block
));
};

// Render Markdown text
const MarkdownBlock = ({ content, isEditing, onEdit, onChange }) => {
if (isEditing) {
    return (
    <div className="relative">
        <textarea
        className="w-full h-64 p-4 border rounded font-mono text-sm"
        value={content}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Type your markdown here..."
        />
        <div className="absolute top-2 right-2">
        <div className="text-xs text-gray-500">Markdown Enabled</div>
        </div>
    </div>
    );
}

// Split content into lines and process each line
const lines = content.split('\n');
const processedLines = lines.map((line, index) => {
    // Headers
    if (line.startsWith('# ')) {
    return <h1 key={index} className="text-3xl font-bold mb-4">{line.slice(2)}</h1>;
    }
    if (line.startsWith('## ')) {
    return <h2 key={index} className="text-2xl font-bold mb-3">{line.slice(3)}</h2>;
    }
    if (line.startsWith('### ')) {
    return <h3 key={index} className="text-xl font-bold mb-2">{line.slice(4)}</h3>;
    }

    // Lists
    if (line.startsWith('- ')) {
    return <li key={index} className="ml-4">{processInlineMarkdown(line.slice(2))}</li>;
    }

    // Regular paragraphs
    return line ? (
    <p key={index} className="mb-4">{processInlineMarkdown(line)}</p>
    ) : (
    <br key={index} />
    );
});

return <div className="prose max-w-none p-4">{processedLines}</div>;
};

// Process inline markdown (bold, italic, links)
const processInlineMarkdown = (text) => {
// Process bold
text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
// Process italic
text = text.replace(/_(.*?)_/g, '<em>$1</em>');
// Process links
text = text.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>');

return <span dangerouslySetInnerHTML={{ __html: text }} />;
};

return (
<div className="min-h-screen bg-gray-50 p-6">
    <Card className="max-w-6xl mx-auto">
    <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-2xl font-bold">Dashboard Builder</CardTitle>
        <div className="flex gap-4">
        <Button className="flex items-center gap-2" onClick={() => document.getElementById('file-upload').click()}>
            <FileText size={16} />
            Upload CSV
        </Button>
        <Button className="flex items-center gap-2" onClick={() => addBlock('text')}>
            <Type size={16} />
            Add Text
        </Button>
        <Button className="flex items-center gap-2" onClick={() => addBlock('chart')}>
            <BarChart size={16} />
            Add Chart
        </Button>
        </div>
    </CardHeader>
    <CardContent>
        <input
        id="file-upload"
        type="file"
        accept=".csv"
        className="hidden"
        onChange={handleFileUpload}
        />
        
        <div className="space-y-4">
        {blocks.map(block => (
            <div
            key={block.id}
            draggable
            onDragStart={() => handleDragStart(block.id)}
            onDragOver={(e) => handleDragOver(e, block.id)}
            className="relative bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:border-blue-500 transition-colors"
            >
            <div className="absolute top-2 right-2 flex gap-2">
                {block.type === 'text' && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleEditMode(block.id)}
                >
                    {block.isEditing ? <Eye size={16} /> : <Edit size={16} />}
                </Button>
                )}
                <Button
                variant="ghost"
                size="sm"
                className="cursor-move"
                >
                <GripHorizontal size={16} />
                </Button>
                <Button
                variant="ghost"
                size="sm"
                onClick={() => setBlocks(blocks.filter(b => b.id !== block.id))}
                >
                <X size={16} />
                </Button>
            </div>

            {block.type === 'text' ? (
                <MarkdownBlock
                content={block.content}
                isEditing={block.isEditing}
                onEdit={() => toggleEditMode(block.id)}
                onChange={(newContent) => updateBlockContent(block.id, newContent)}
                />
            ) : (
                <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                    <select
                    className="p-2 border rounded"
                    value={block.content.chartType}
                    onChange={(e) => updateBlockContent(block.id, {
                        ...block.content,
                        chartType: e.target.value
                    })}
                    >
                    <option value="line">Line Chart</option>
                    <option value="scatter">Scatter Plot</option>
                    </select>
                    <select
                    className="p-2 border rounded"
                    value={block.content.xAxis}
                    onChange={(e) => updateBlockContent(block.id, {
                        ...block.content,
                        xAxis: e.target.value
                    })}
                    >
                    {columns.map(column => (
                        <option key={column} value={column}>{column}</option>
                    ))}
                    </select>
                    <select
                    className="p-2 border rounded"
                    value={block.content.yAxis}
                    onChange={(e) => updateBlockContent(block.id, {
                        ...block.content,
                        yAxis: e.target.value
                    })}
                    >
                    {columns.map(column => (
                        <option key={column} value={column}>{column}</option>
                    ))}
                    </select>
                </div>
                <div className="flex justify-center">
                    {renderChart(block)}
                </div>
                </div>
            )}
            </div>
        ))}
        </div>
    </CardContent>
    </Card>
</div>
);
};

export default DashboardBuilder;