import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Input, Button, Table, Popconfirm } from 'antd';
import 'antd/dist/reset.css';
import './App.css';
import Chart from 'chart.js/auto';
import { debounce } from 'lodash';
import { SearchOutlined, EditOutlined } from '@ant-design/icons';

function HistoryPage() {
  const [apiResponse, setApiResponse] = useState(null);
  const [filteredData, setFilteredData] = useState(null);
  const chartInstanceRef = useRef(null);
  const [editingKey, setEditingKey] = useState('');

  const filterData = (value, record) => {
    console.log(value);
    console.log(record);
    const filtered = apiResponse.filter((record) => record.NOMBRE.includes(value));
    console.log(filtered);
 
    return record.NOMBRE.includes(value);
   // setFilteredData(filtered);

    //apiResponse.filter((record) => record.NOMBRE.includes(value));
   
  //  console.log(filtered);
  };
  const debouncedFilterData = debounce(filterData, 3000); // 300 milliseconds debounce time
  const columns = useMemo(
    () => [
      {
        title: 'Fecha',
        dataIndex: 'FECHA',
        key: 'FECHA',
        sorter: (a, b) => new Date(b.FECHA) - new Date(a.FECHA),
      },
      { 
        title: 'Nombre',
        dataIndex: 'NOMBRE',
        key: 'NOMBRE',
        filters: [],
        onFilter:(value, record) => filterData (value,record),
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
        filterIcon: (filtered) => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
        onFilterDropdownOpenChange: (visible) => {
          if (visible) {
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
        editable: true,
        render: (text, record) => {
          const isEditing = record.ID_REGISTRO === editingKey;
          return isEditing ? (
            <Input value={text} onChange={(e) => handleComentarioChange(e.target.value, record.ID_REGISTRO)} />
          ) : (
            text
          );
        },
      },
      {
        title: 'Editar comentario',
        dataIndex: 'action',
        key: 'action',
        render: (_, record) => {
          const isEditing = record.ID_REGISTRO === editingKey;
          return isEditing ? (
            <span>
              <Button type="primary" onClick={() => handleSave(record.ID_REGISTRO, record.COMENTARIO)}>
                Save
              </Button>
              <Popconfirm title="Sure to cancel?" onConfirm={() => handleCancel()}>
                <Button danger>Cancel</Button>
              </Popconfirm>
            </span>
          ) : (
            <Button
              icon={<EditOutlined />}
              disabled={editingKey !== ''}
              onClick={() => handleEdit(record.ID_REGISTRO)}
            />
          );
        },
      },
    ],
    [apiResponse, editingKey]
  );

  useEffect(() => {
    async function fetchData() {
      try {
        const url = 'https://glucosasangre.000webhostapp.com/glucosa_api.php';
        const response = await fetch(`${url}?command=get`);
        const data = await response.json();
        setApiResponse(data);
        const sortedData = [...data].sort((a, b) => new Date(b.FECHA) - new Date(a.FECHA));
        setFilteredData(sortedData);
      } catch (error) {
        console.error('Error:', error);
      }
    }

    fetchData();
  }, []);

  useEffect(() => {
    if (filteredData) {
      console.log(filteredData);
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }

      const ctx = document.getElementById('histogramChart');
      const newChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: filteredData.map((item) => item.FECHA),
          datasets: [
            {
              label: 'Nivel de Glucosa',
              data: filteredData.map((item) => parseFloat(item.NIVEL)),
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
              reverse: true,
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
      chartInstanceRef.current = newChartInstance;
    }
  }, [filteredData, chartInstanceRef]);
  
  const handleComentarioChange = (value, id_registro) => {
    const newData = [...filteredData];
    const index = newData.findIndex((item) => id_registro === item.ID_REGISTRO);
    if (index > -1) {
      newData[index].COMENTARIO = value;
      setFilteredData(newData);
    }
  };

  // Function to start editing
  const handleEdit = (id_registro) => {
    setEditingKey(id_registro);
  };

  // Function to save edited comentario
  const handleSave = async (id_registro, comentario) => {
    try {
      const url = 'https://glucosasangre.000webhostapp.com/glucosa_api.php';
      const record = filteredData.find((item) => id_registro === item.ID_REGISTRO);
      const DataEncoded = new URLSearchParams();
      DataEncoded.append('command', 'update');
      DataEncoded.append('id_registro', id_registro,);
      DataEncoded.append('comentario', comentario);
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: DataEncoded.toString(),
        mode: 'cors',
      });
      if (response.ok) {
        // Successfully updated, reset editing key
        setEditingKey('');
      } else {
        // Handle error
        console.error('Failed to update comentario');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Function to cancel editing
  const handleCancel = () => {
    setEditingKey('');
  };
  return (
    <div className="App">

    
      <div>
        <h1>Sistema de medición de glucosa en Sangre - Historial</h1>


    
     

      <div>
          <h3>Histograma de Niveles de Glucosa</h3>
          <canvas id="histogramChart" width="400" height="200"></canvas>
        </div>

        <h3>Historial de días</h3>

      </div>
   
      <div className="table-container">
          <Table
            dataSource={apiResponse}
            columns={columns}
            rowKey={(record) => record.ID_REGISTRO}
            pagination={{ pageSize: 10 }}
          />
        </div>
      
    </div>

  );
}

export default HistoryPage;