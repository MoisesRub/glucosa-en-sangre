import React, { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Button, Table } from 'antd';
import 'antd/dist/reset.css';
import './App.css';
import Chart from 'chart.js/auto'; // Import Chart.js

function HistoryPage() {  
  const [apiResponse, setApiResponse] = useState(null);

  const columns = [
    {
      title: 'Fecha',
      dataIndex: 'FECHA',
      key: 'FECHA',
      sorter: (a, b) => new Date(b.FECHA) - new Date(a.FECHA), // Sort by date in descending order
     
    },
    {
      title: 'Nombre',
      dataIndex: 'NOMBRE',
      key: 'NOMBRE',
    },
    {
      title: 'Nivel',
      dataIndex: 'NIVEL',
      key: 'NIVEL',
    },
    {
      title: 'Comentario',
      dataIndex: 'COMENTARIO',
      key: 'COMENTARIO',
    },
  ];



  // Use useEffect to update the chart when the API response changes
  useEffect(() => {
    async function fetchData() {
        try {
          const url = 'https://glucosasangre.000webhostapp.com/glucosa_api.php';
          const response = await fetch(`${url}?command=get`);
          const data = await response.json();
  
          // Sort the data by date in descending order
          const sortedData = [...data].sort((a, b) => new Date(b.FECHA) - new Date(a.FECHA));
  
          // Extract NIVEL data for the histogram
          const nivelData = sortedData.map((item) => parseFloat(item.NIVEL));
  
          // Create a histogram chart using Chart.js
          const ctx = document.getElementById('histogramChart');
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: apiResponse.map((item) => item.FECHA),
          datasets: [
            {
              label: 'Nivel de Glucosa',
              data: nivelData,
              backgroundColor: 'rgba(75,192,192,0.2)',
              borderColor: 'rgba(75,192,192,1)',
              borderWidth: 1,
            },
          ],
        },
        options: {
          scales: {
            x: {
              type: 'category',
              title: {
                display: true,
                text: 'Fecha',
              },
            },
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Nivel de Glucosa',
              },
            },
          },
        },
      });
        // Set the sorted data in the state
        setApiResponse(sortedData);
      } catch (error) {
        console.error('Error:', error);
      }
    }

    fetchData();
  }, []);
  return (
    <div className="App">
      <header className="App-header">
        <h1>Sistema de medición de glucosa en Sangre - Historial</h1>

        <div>
          <h3>Histograma de Niveles de Glucosa</h3>
          <canvas id="histogramChart" width="400" height="200"></canvas>
        </div>

        <h3>Historial de días</h3>
        <div className="table-container">
          <Table
            dataSource={apiResponse}
            columns={columns}
            rowKey={(record) => record.ID_REGISTRO}
            pagination={{ pageSize: 10 }}
          />
        </div>
      </header>
    </div>
  );
}

export default HistoryPage;