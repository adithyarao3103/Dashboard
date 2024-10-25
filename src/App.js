import React, { useState } from 'react';
import CSVReader from 'react-csv-reader';
import { Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, registerables } from 'chart.js';
import htmlToImage from 'html-to-image';
import { saveAs } from 'file-saver';
import ReactMarkdown from 'react-markdown';
import { Button, Card, Container, Row, Col, Form } from 'react-bootstrap';

ChartJS.register(...registerables);

function App() {
const [csvData, setCsvData] = useState([]);
const [textCards, setTextCards] = useState([]);
const [graphCards, setGraphCards] = useState([]);
const [markdownInput, setMarkdownInput] = useState('');
const [chartType, setChartType] = useState('Bar');
const [selectedData, setSelectedData] = useState([]);

const handleFileLoad = (data) => {
setCsvData(data);
setSelectedData(data.slice(1));
};

const addTextCard = () => {
setTextCards([...textCards, markdownInput]);
setMarkdownInput('');
};

const addGraphCard = () => {
setGraphCards([...graphCards, { chartType, data: selectedData }]);
};

const downloadDashboard = () => {
const dashboard = document.getElementById('dashboard');
htmlToImage.toBlob(dashboard).then((blob) => {
    saveAs(blob, 'dashboard.html');
});
};

return (
<Container className="mt-5">
    <h1 className="text-center mb-4">CSV Dashboard Builder</h1>
    
    <Card className="p-4 mb-4">
    <h5>Upload CSV</h5>
    <CSVReader onFileLoaded={handleFileLoad} parserOptions={{ header: true }} />
    </Card>

    <Card className="p-4 mb-4">
    <h5>Add Text Card</h5>
    <Form.Control
        as="textarea"
        rows={3}
        placeholder="Enter markdown text"
        value={markdownInput}
        onChange={(e) => setMarkdownInput(e.target.value)}
    />
    <Button variant="primary" onClick={addTextCard} className="mt-2">Add Text Card</Button>
    </Card>

    <Card className="p-4 mb-4">
    <h5>Add Graph Card</h5>
    <Form.Select onChange={(e) => setChartType(e.target.value)} className="mb-2">
        <option value="Bar">Bar Chart</option>
        <option value="Line">Line Chart</option>
    </Form.Select>
    <Button variant="primary" onClick={addGraphCard}>Add Graph Card</Button>
    </Card>

    <div id="dashboard">
    <Row className="mb-4">
        {textCards.map((text, idx) => (
        <Col md={6} className="mb-4" key={idx}>
            <Card>
            <Card.Body>
                <ReactMarkdown>{text}</ReactMarkdown>
            </Card.Body>
            </Card>
        </Col>
        ))}

        {graphCards.map((graph, idx) => (
        <Col md={6} className="mb-4" key={idx}>
            <Card>
            <Card.Body>
                {graph.chartType === 'Bar' ? (
                <Bar
                    data={{
                    labels: csvData[0],
                    datasets: [
                        {
                        label: 'Data',
                        data: graph.data.map((row) => row[1]),
                        backgroundColor: 'rgba(75,192,192,0.4)',
                        },
                    ],
                    }}
                />
                ) : (
                <Line
                    data={{
                    labels: csvData[0],
                    datasets: [
                        {
                        label: 'Data',
                        data: graph.data.map((row) => row[1]),
                        borderColor: 'rgba(75,192,192,1)',
                        },
                    ],
                    }}
                />
                )}
            </Card.Body>
            </Card>
        </Col>
        ))}
    </Row>
    </div>

    <Button variant="success" onClick={downloadDashboard}>Download Dashboard</Button>
</Container>
);
}

export default App;
