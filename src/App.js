import React, { useState } from 'react';
import { Form, Input, InputNumber, Button } from 'antd';


function App() {
  const [formData, setFormData] = useState({
    name: '',
    level: null,
  });
  const [apiResponse, setApiResponse] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('https://glucosasangre.000webhostapp.com/glucosa_api.php', {
        method: 'POST',
         mode:'cors'
        ,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          command: 'read'
        }),
      });

      const data = await response.json();
      setApiResponse(data);

      console.log(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <Form>
          <Form.Item>
            <Input
              placeholder='Nombre del paciente'
              name='name'
              value={formData.name}
              onChange={handleChange}
            />
          </Form.Item>
          <Form.Item>
            <InputNumber
              placeholder="Nivel de glucosa en sangre"
              name='level'
              value={formData.level}
              onChange={(value) => setFormData({ ...formData, level: value })}
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" onClick={handleSubmit}>
              Registrar
            </Button>
          </Form.Item>
        </Form>

        {apiResponse && (
          <div>
            <h3>API Response:</h3>
            <pre>{JSON.stringify(apiResponse, null, 2)}</pre>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
