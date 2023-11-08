import logo from './logo.svg';
import './App.css';
import { Form, Input, InputNumber, Button } from 'antd';
import 'antd/dist/reset.css';
import React, { useState } from 'react';


function App() {
  const [formData, setFormData] = useState({
    name: '',
    level: null,
  });
  const [apiResponse, setApiResponse] = useState(null);

  const formDataWithCommand = {
    ...formData,
    command: 'read'
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const response = await fetch('https://glucosasangre.000webhostapp.com/glucosa_api.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formDataWithCommand),
      });
  
      //const data = await response.json();
      const data = await response.json();

      setApiResponse(data);
  
      // Handle the response data here
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
  value={formData.name}>
  </Input>

</Form.Item>
          <Form.Item>
          <InputNumber

  placeholder="Nivel de glucosa en sangre"
  name='level'
  value={formData.level}
  />

          </Form.Item>
          <Form.Item>
          <Button type="primary" onClick={handleSubmit}>Registrar</Button>
          </Form.Item>
        </Form>


        <div>
     
      </div>
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
