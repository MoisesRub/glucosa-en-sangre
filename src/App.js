import React, { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Button, Table , Card } from 'antd';
import 'antd/dist/reset.css';
import './App.css';
import Chart from 'chart.js/auto'; // Import Chart.js

function App() {
  const [formData, setFormData] = useState({
    name: '',
    level: null,
  });
  
  const [apiResponse, setApiResponse] = useState(null);
  const [showForm, setShowForm] = useState(true);
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const url = 'https://glucosasangre.000webhostapp.com/glucosa_api.php';
      const formDataEncoded = new URLSearchParams();

      for (const key in formData) {
        formDataEncoded.append(key, formData[key]);
      }

      formDataEncoded.append('command', 'read');

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        mode: 'cors',
        body: formDataEncoded.toString(),
      });

      const data = await response.json();
      setApiResponse(data);

      console.log(data);
      setShowForm(false);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Use useEffect to update the chart when the API response changes
  useEffect(() => {
    if (apiResponse) {
      // Extract NIVEL data for the histogram
      const nivelData = apiResponse.map((item) => parseFloat(item.NIVEL));

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
              reverse: true, // Set to true for ascending order, false for descending
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
    }
  }, [apiResponse]);

  return (
    <div className="App">
     
        <h1>Sistema de medición de glucosa en Sangre</h1>
        {showForm && (
          <>
        <p>Añada su nivel de glucosa actual para poder ver su 
          historial</p>

        <Form>
          <Form.Item className="FormItem">
            <Input
              placeholder='Nombre del paciente'
              name='name'
              value={formData.name}
              className="InputField"
              onChange={handleChange}
            />
          </Form.Item >
          <Form.Item className="FormItem">
            <InputNumber
              placeholder="Nivel de glucosa en sangre"
              name='level'
              value={formData.level}
              className="InputNumberField"
              onChange={(value) => setFormData({ ...formData, level: value })}
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" onClick={handleSubmit}>
              Registrar
            </Button>
          </Form.Item>
        </Form> </> )}
        {apiResponse && (
        

         
          < >
                        
              <h3>Histograma de Niveles de Glucosa</h3>
              <canvas id="histogramChart" width="100" height="50"></canvas>
            
            <h3>Historial de días</h3>
            <div className="table-container">
            
          <Table
            dataSource={apiResponse}
            columns={columns}
            rowKey={(record) => record.ID_REGISTRO}
            pagination={{ pageSize: 10 }}
          />
     
          </div>
        
        </>
       

         

        )}
     
    </div>
  );
}

export default App;
