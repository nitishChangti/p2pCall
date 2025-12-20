import { Provider } from 'react-redux'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import store from './store/store.js'
import AppRouter from './router/AppRouter.jsx'


createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <AppRouter/>
  </Provider>
)
