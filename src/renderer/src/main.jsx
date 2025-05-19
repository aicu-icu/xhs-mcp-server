import { createRoot } from 'react-dom/client'
import './assets/index.css'
import { useState } from 'react'
import App from './App.jsx'
import { ConfigProvider, theme } from 'antd'

const Main = () => {
  const [dark, setDark] = useState(localStorage.getItem('dark') === 'true');
  const setDarkMode = (isDark) => {
    localStorage.setItem('dark', isDark ? 'true' : 'false');
    setDark(isDark);
  }
  return (
    <div id='main' style={{
      backgroundColor: dark ? '#222' : '#fff',
    }}>
      <ConfigProvider theme={{
        algorithm: dark ? theme.darkAlgorithm : theme.defaultAlgorithm,
      }}>
        <App setDark={setDarkMode} dark={dark} />
      </ConfigProvider>
    </div>
  )
}
createRoot(document.getElementById('root')).render(<Main />)
