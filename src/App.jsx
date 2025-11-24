import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [refresh, setRefresh] = useState(3);
  const [iot, setIot] = useState([]);
  const [inputs, setInputs] = useState([]);
  const [discovering, setDiscovering] = useState(false);

  const fetchIoTs = async () => {
    const response = await fetch('http://localhost:8080/api/discover', {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    // console.log(response, data);
    const data = await response.json();
    const things = data?.iot || [];
    let inputData = [];
    if (inputs && inputs.length) {
      inputData = things.map(({topic, desirable}) => {
        const idx = inputs.findIndex(t => t.topic === topic);
        if (idx !== -1 && inputs[idx].desirable !== desirable) {
          return { topic, desirable: inputs[idx].desirable };
        }
        return { topic, desirable }
      });
    } else {
      inputData = things.map(({topic, desirable}) => { return { topic, desirable }; });  
    }
    setInputs(inputData);
    setIot(things);
  };

  useEffect(() => {
    fetchIoTs();
  }, []);

  useEffect(() => {
    let timeoutId = setInterval(() => {
      fetchIoTs();
    }, refresh * 1000);
    return () => {
      clearTimeout(timeoutId);
    };
  }, [refresh, inputs]);

  const updateThing = async (thing) => {
    await fetch('http://localhost:8080/api/message', {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(thing)
    })
  }

  const onChangeHandle = (e) => {
    const topic = e.target.dataset.topic;
    const idx = inputs.findIndex(t => t.topic === topic);
    const thing = inputs[idx];
    const newThing = Object.assign({}, thing);
    newThing.desirable = e.target.value;
    setInputs((oldinputs) => oldinputs.splice(idx, 1, newThing));
  };
  
  const onClickHandle = async (e) => {
    const topic = e.target.dataset.topic;
    const idx = inputs.findIndex(t => t.topic === topic);
    const thing = inputs[idx];
    await updateThing(thing)
  };

  const onChangeRefresh = (e) => {
    setRefresh(+e.target.value);
  };

  return (
    <>
      <header>
        <h1>Internet of Things: AC Monitor System</h1>
      </header>
      <div>
        <div className="sidebar">
          <h2>Team 35</h2>
          <ul>
            <li>Jose Victor Villa Jimenez</li>
            <li>Carlos Sevilla Silva</li>
            <li>Alan Galeana Vega</li>
          </ul>
        </div>
        <main>
          <div className="info">
            <div>
              <label htmlFor="refresh">Refresh (in seconds): </label>
              <select id="refresh" name="refresh" value={refresh} onChange={onChangeRefresh}>
                {Array(10).fill(0).map((_, i) => 
                  <option
                    key={i}
                    value={i + 1}>
                      {i + 1}
                  </option>)}
              </select>
          </div>
          </div>
          <div className="card">
            {iot && inputs && inputs.length === iot.length && iot.map((v, i) =>
              <section key={v.topic} >
                <p>Thing: {v.topic}</p>
                <p>current value: {v.value}</p>
                <input
                  type='number'
                  value={inputs[i].desirable}
                  data-topic={inputs[i].topic}
                  onChange={onChangeHandle} />
                <button
                  type='button'
                  data-topic={inputs[i].topic}
                  onClick={onClickHandle}>
                    Update
                </button>
              </section>
            )}
          </div>
          <p className="read-the-docs">
            HiveMQ Cloud, ExpressJS, ViteJS, ReactJS, Wokwi Simulator, VS Code PlatformIO
          </p>
        </main>
      </div>
    </>
  )
}

export default App
