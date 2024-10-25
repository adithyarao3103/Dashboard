import React, { useState, useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ScatterChart, Scatter } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Plus, GripHorizontal, X, Type, BarChart, Eye, Edit, Download } from 'lucide-react';

const DashboardBuilder = () => {
const [data, setData] = useState([]);
const [columns, setColumns] = useState([]);
const [blocks, setBlocks] = useState([]);
const [draggedBlock, setDraggedBlock] = useState(null);
const [editingText, setEditingText] = useState(null);
const [dashboardTitle, setDashboardTitle] = useState('My Dashboard');

// Export dashboard as HTML
const exportDashboard = () => {
// Create a minimal version of recharts for standalone use
const rechartsCode = `
    <script src="https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/recharts/2.9.0/Recharts.js"></script>
`;

// Generate the dashboard HTML
const dashboardHtml = `
    <!DOCTYPE html>
    <html>
    <head>
    <title>${dashboardTitle}</title>
    ${rechartsCode}
    <style>
        /* Reset and base styles */
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        line-height: 1.6;
        color: #333;
        background: #f5f5f5;
        padding: 2rem;
        }

        /* Dashboard container */
        .dashboard {
        max-width: 1200px;
        margin: 0 auto;
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        overflow: hidden;
        }

        /* Header */
        .dashboard-header {
        padding: 2rem;
        background: #fff;
        border-bottom: 1px solid #eaeaea;
        }

        .dashboard-title {
        font-size: 2rem;
        font-weight: 600;
        color: #1a1a1a;
        }

        /* Content */
        .dashboard-content {
        padding: 2rem;
        }

        /* Blocks */
        .block {
        background: white;
        border: 1px solid #eaeaea;
        border-radius: 8px;
        padding: 1.5rem;
        margin-bottom: 1.5rem;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }

        /* Text content */
        .text-content {
        font-size: 1rem;
        color: #4a4a4a;
        }

        .text-content h1 { font-size: 2em; margin-bottom: 0.5em; }
        .text-content h2 { font-size: 1.5em; margin-bottom: 0.5em; }
        .text-content h3 { font-size: 1.25em; margin-bottom: 0.5em; }
        .text-content p { margin-bottom: 1em; }
        .text-content ul { margin-left: 1.5em; margin-bottom: 1em; }
        .text-content a { color: #0070f3; text-decoration: none; }
        .text-content a:hover { text-decoration: underline; }

        /* Chart container */
        .chart-container {
        display: flex;
        justify-content: center;
        padding: 1rem;
        background: #fafafa;
        border-radius: 8px;
        }
    </style>
    </head>
    <body>
    <div class="dashboard">
        <div class="dashboard-header">
        <h1 class="dashboard-title">${dashboardTitle}</h1>
        </div>
        <div class="dashboard-content">
        ${blocks.map(block => {
            if (block.type === 'text') {
            return `
                <div class="block">
                <div class="text-content">
                    ${renderMarkdownToHtml(block.content)}
                </div>
                </div>
            `;
            } else {
            return `
                <div class="block">
                <div class="chart-container">
                    <div id="chart-${block.id}"></div>
                </div>
                </div>
            `;
            }
        }).join('')}
        </div>
    </div>
    <script>
        const data = ${JSON.stringify(data)};
        
        ${blocks
        .filter(block => block.type === 'chart')
        .map(block => `
            const chart${block.id} = ${generateChartCode(block)};
            ReactDOM.render(chart${block.id}, document.getElementById('chart-${block.id}'));
        `).join('\n')}
    </script>
    </body>
    </html>
`;

// Create and trigger download
const blob = new Blob([dashboardHtml], { type: 'text/html' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `${dashboardTitle.toLowerCase().replace(/\s+/g, '-')}.html`;
document.body.appendChild(a);
a.click();
document.body.removeChild(a);
URL.revokeObjectURL(url);
};

// Helper function to generate chart code for export
const generateChartCode = (block) => {
const chartComponent = block.content.chartType === 'line' ? 'LineChart' : 'ScatterChart';
return `
    React.createElement(Recharts.${chartComponent}, {
    width: 600,
    height: 400,
    data: data,
    margin: { top: 20, right: 30, left: 20, bottom: 30 }
    },
    React.createElement(Recharts.CartesianGrid, { strokeDasharray: "3 3" }),
    React.createElement(Recharts.XAxis, { dataKey: "${block.content.xAxis}" }),
    React.createElement(Recharts.YAxis, { dataKey: "${block.content.yAxis}" }),
    React.createElement(Recharts.Tooltip),
    ${block.content.chartType === 'line' 
        ? `React.createElement(Recharts.Line, { type: "monotone", dataKey: "${block.content.yAxis}", stroke: "#8884d8" })`
        : `React.createElement(Recharts.Scatter, { data: data, fill: "#8884d8" })`
    }
    )
`;
};

// Helper function to convert markdown to HTML for export
const renderMarkdownToHtml = (markdown) => {
let html = markdown
    // Headers
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/_(.*?)_/g, '<em>$1</em>')
    // Lists
    .replace(/^- (.*$)/gm, '<li>$1</li>')
    // Links
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>')
    // Paragraphs
    .replace(/^(?!<[hl]|<li)(.*$)/gm, '<p>$1</p>');

// Wrap lists in ul tags
if (html.includes('<li>')) {
    html = html.replace(/(<li>.*<\/li>)/g, '<ul>$1</ul>');
}

return html;
};

// ... (rest of the component code remains the same, but add the following to the JSX)

return (
<div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6">
    <Card className="max-w-6xl mx-auto border-none shadow-lg">
    <CardHeader className="flex flex-row items-center justify-between bg-white rounded-t-lg border-b border-gray-100">
        <div className="flex flex-col gap-2">
        <CardTitle className="text-2xl font-bold text-gray-800">
            <input
            type="text"
            value={dashboardTitle}
            onChange={(e) => setDashboardTitle(e.target.value)}
            className="bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-2 py-1"
            />
        </CardTitle>
        <p className="text-sm text-gray-500">
            Build your dashboard by adding blocks and uploading data
        </p>
        </div>
        <div className="flex gap-4">
        <Button 
            className="flex items-center gap-2 bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
            onClick={() => document.getElementById('file-upload').click()}
        >
            <FileText size={16} />
            Upload CSV
        </Button>
        <Button 
            className="flex items-center gap-2 bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
            onClick={() => addBlock('text')}
        >
            <Type size={16} />
            Add Text
        </Button>
        <Button 
            className="flex items-center gap-2 bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
            onClick={() => addBlock('chart')}
        >
            <BarChart size={16} />
            Add Chart
        </Button>
        <Button 
            className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700"
            onClick={exportDashboard}
        >
            <Download size={16} />
            Export
        </Button>
        </div>
    </CardHeader>
    <CardContent className="space-y-6 p-6">
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
            className="relative bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:border-blue-500 transition-colors duration-200 ease-in-out"
            >
            <div className="absolute top-2 right-2 flex gap-2">
                {block.type === 'text' && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleEditMode(block.id)}
                    className="text-gray-500 hover:text-gray-700"
                >
                    {block.isEditing ? <Eye size={16} /> : <Edit size={16} />}
                </Button>
                )}
                <Button
                variant="ghost"
                size="sm"
                className="cursor-move text-gray-500 hover:text-gray-700"
                >
                <GripHorizontal size={16} />
                </Button>
                <Button
                variant="ghost"
                size="sm"
                onClick={() => setBlocks(blocks.filter(b => b.id !== block.id))}
                className="text-gray-500 hover:text-red-600"
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
                    className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    className="p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                <div className="flex justify-center bg-gray-50 p-4 rounded-lg">
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