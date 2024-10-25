import React, { useState, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ScatterChart, Scatter } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { FileText, Plus, GripHorizontal, X, Type, BarChart, Eye, Edit } from 'lucide-react';

const MarkdownBlock = React.memo(({ content, isEditing, onEdit, onChange }) => {
const textareaRef = useRef(null);

if (isEditing) {
return (
    <div className="relative">
    <textarea
        ref={textareaRef}
        className="w-full min-h-64 p-4 border rounded-lg font-mono text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
        value={content}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Type your markdown here..."
    />
    <div className="absolute top-3 right-3">
        <div className="text-xs text-gray-500 bg-white px-2 py-1 rounded-md shadow-sm">Markdown Enabled</div>
    </div>
    </div>
);
}

const processInlineMarkdown = (text) => {
text = text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>');
text = text.replace(/_(.*?)_/g, '<em class="italic">$1</em>');
text = text.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-indigo-600 hover:text-indigo-800 transition-colors" target="_blank">$1</a>');

return <span dangerouslySetInnerHTML={{ __html: text }} />;
};

const lines = content.split('\n');
const processedLines = lines.map((line, index) => {
if (line.startsWith('# ')) {
    return <h1 key={index} className="text-3xl font-bold mb-6 text-gray-900">{line.slice(2)}</h1>;
}
if (line.startsWith('## ')) {
    return <h2 key={index} className="text-2xl font-bold mb-4 text-gray-800">{line.slice(3)}</h2>;
}
if (line.startsWith('### ')) {
    return <h3 key={index} className="text-xl font-bold mb-3 text-gray-700">{line.slice(4)}</h3>;
}

if (line.startsWith('- ')) {
    return <li key={index} className="ml-6 mb-2 text-gray-700">{processInlineMarkdown(line.slice(2))}</li>;
}

return line ? (
    <p key={index} className="mb-4 text-gray-700 leading-relaxed">{processInlineMarkdown(line)}</p>
) : (
    <br key={index} />
);
});

return <div className="prose max-w-none p-4">{processedLines}</div>;
});

const DashboardBuilder = () => {
const [data, setData] = useState([]);
const [columns, setColumns] = useState([]);
const [blocks, setBlocks] = useState([]);
const [draggedBlock, setDraggedBlock] = useState(null);

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

const addBlock = (type) => {
const newBlock = {
    id: Date.now(),
    type,
    content: type === 'text' ? '# New Text Block\n\nStart typing your content here...\n\n- Use **markdown** formatting\n- Create _italic_ text\n-' : {
    chartType: 'line',
    xAxis: columns[0] || '',
    yAxis: columns[1] || '',
    },
    isEditing: type === 'text'
};
setBlocks([...blocks, newBlock]);
};

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
        <CartesianGrid strokeDasharray="3 3" className="opacity-50" />
        <XAxis dataKey={block.content.xAxis} />
        <YAxis dataKey={block.content.yAxis} />
        <Tooltip contentStyle={{ background: 'white', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} />
        <Line type="monotone" dataKey={block.content.yAxis} stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1' }} />
    </LineChart>
    );
} else {
    return (
    <ScatterChart {...chartProps}>
        <CartesianGrid strokeDasharray="3 3" className="opacity-50" />
        <XAxis dataKey={block.content.xAxis} />
        <YAxis dataKey={block.content.yAxis} />
        <Tooltip contentStyle={{ background: 'white', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} />
        <Scatter data={data} fill="#6366f1" />
    </ScatterChart>
    );
}
};

const toggleEditMode = (blockId) => {
setBlocks(blocks.map(block => 
    block.id === blockId 
    ? { ...block, isEditing: !block.isEditing }
    : block
));
};

const updateBlockContent = (blockId, newContent) => {
setBlocks(prevBlocks => 
    prevBlocks.map(block => 
    block.id === blockId ? { ...block, content: newContent } : block
    )
);
};

return (
<div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
    <Card className="max-w-6xl mx-auto shadow-lg">
    <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100 bg-white rounded-t-lg">
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-indigo-800 bg-clip-text text-transparent">
        Dashboard Builder
        </CardTitle>
        <div className="flex gap-3">
        <Button 
            className="flex items-center gap-2 bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors"
            onClick={() => document.getElementById('file-upload').click()}
        >
            <FileText size={16} />
            Upload CSV
        </Button>
        <Button 
            className="flex items-center gap-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
            onClick={() => addBlock('text')}
        >
            <Type size={16} />
            Add Text
        </Button>
        <Button 
            className="flex items-center gap-2 bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
            onClick={() => addBlock('chart')}
        >
            <BarChart size={16} />
            Add Chart
        </Button>
        </div>
    </CardHeader>
    <CardContent className="p-6">
        <input
        id="file-upload"
        type="file"
        accept=".csv"
        className="hidden"
        onChange={handleFileUpload}
        />
        
        <div className="space-y-6">
        {blocks.map(block => (
            <div
            key={block.id}
            draggable
            onDragStart={() => handleDragStart(block.id)}
            onDragOver={(e) => handleDragOver(e, block.id)}
            className="relative bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:border-indigo-500 hover:shadow-md transition-all duration-200"
            >
            <div className="absolute top-3 right-3 flex gap-2">
                {block.type === 'text' && (
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-500 hover:text-indigo-600 hover:bg-indigo-50"
                    onClick={() => toggleEditMode(block.id)}
                >
                    {block.isEditing ? <Eye size={16} /> : <Edit size={16} />}
                </Button>
                )}
                <Button
                variant="ghost"
                size="sm"
                className="cursor-move text-gray-500 hover:text-indigo-600 hover:bg-indigo-50"
                >
                <GripHorizontal size={16} />
                </Button>
                <Button
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-red-600 hover:bg-red-50"
                onClick={() => setBlocks(blocks.filter(b => b.id !== block.id))}
                >
                <X size={16} />
                </Button>
            </div>

            {block.type === 'text' ? (
                <MarkdownBlock
                key={block.id}
                content={block.content}
                isEditing={block.isEditing}
                onEdit={() => toggleEditMode(block.id)}
                onChange={(newContent) => updateBlockContent(block.id, newContent)}
                />
            ) : (
                <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                    <select
                    className="p-2 border rounded-lg bg-white hover:border-indigo-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
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
                    className="p-2 border rounded-lg bg-white hover:border-indigo-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
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
                    className="p-2 border rounded-lg bg-white hover:border-indigo-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all"
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
                <div className="flex justify-center bg-gray-50 p-6 rounded-lg">
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