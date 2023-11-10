import React, { useState, useEffect } from 'react';
import { Input, Button, Table } from 'antd';
import 'antd/dist/reset.css';
import './App.css';
import Chart from 'chart.js/auto'; // Import Chart.js

import { SearchOutlined } from '@ant-design/icons';

function HistoryPage() {
  const [apiResponse, setApiResponse] = useState(null);
  const [filteredData, setFilteredData] = useState(null);
  const [chartInstance, setChartInstance] = useState(null);

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
      filters: [], // Initialize empty array for filters
      onFilter: (value, record) => record.NOMBRE.includes(value), // Filter function
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Buscar nombre"
            value={selectedKeys[0]}
            onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
          />
          <Button
            type="primary"
            onClick={() => confirm()}
            size="small"
            style={{ width: 90, marginRight: 8 }}
          >
            Buscar
          </Button>
          <Button onClick={() => clearFilters()} size="small" style={{ width: 90 }}>
            Reiniciar
          </Button>
        </div>
      ),
      filterIcon: (filtered) => (
        <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
      ),
      onFilterDropdownOpenChange: (visible) => {
        if (visible) {
          // Pre-fetch distinct values for the filter dropdown
          const distinctNames = Array.from(new Set(apiResponse.map((record) => record.NOMBRE)));
          columns.find((col) => col.key === 'NOMBRE').filters = distinctNames.map((name) => ({
            text: name,
            value: name,
          }));
        }
      },
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

  // Use useEffect to fetch data when the component mounts
  useEffect(() => {
    async function fetchData() {
      try {
        const url = 'https://glucosasangre.000webhostapp.com/glucosa_api.php';
        const response = await fetch(`${url}?command=get`);
        const data = await response.json();

        // Set the API response in the state
        setApiResponse(data);

        // Sort the data by date in descending order
        const sortedData = [...data].sort((a, b) => new Date(b.FECHA) - new Date(a.FECHA));

        // Set the sorted data in the state
        setFilteredData(sortedData);
      } catch (error) {
        console.error('Error:', error);
      }
    }

    fetchData();
  }, []);

  // Use useEffect to update the chart when the filtered data changes
  useEffect(() => {
    if (filteredData) {
      // Extract NIVEL data for the histogram
      const nivelData = filteredData.map((item) => parseFloat(item.NIVEL));

            // Destroy the previous chart if it exists
            if (chartInstance) {
                chartInstance.destroy();
              }

      // Create a histogram chart using Chart.js
      const ctx = document.getElementById('histogramChart');
      const newChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: filteredData.map((item) => item.FECHA),
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
      setChartInstance(newChartInstance);
    }
  }, [filteredData]);
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