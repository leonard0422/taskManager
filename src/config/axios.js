import axios from 'axios'

const clienteAxios = axios.create({
    baseURL: import.meta.env.VITE_VUE_API_URL,
    headers:{
        'Authorization': `Bearer ${import.meta.env.VITE_API_TOKEN_TASK}`,
        'Accept' : 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    },
})

export default clienteAxios