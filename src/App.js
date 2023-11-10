import React, { useState } from 'react';
import { Form, Input, InputNumber, Button } from 'antd';
import 'antd/dist/reset.css';


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
