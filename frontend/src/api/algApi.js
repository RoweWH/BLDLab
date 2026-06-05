import axios from 'axios';

const BLDDB = 'https://rowewh.com/api';

export async function getEdgeAlgs(buffer, first, second) {
   const response = await axios.get(`${BLDDB}/Edges?buffer=${buffer}&first=${first}&second=${second}`);
   return response;
}

export async function getEdgeAlgById(id) {
   const response = await axios.get(`${BLDDB}/Edges/${id}`);
   return response;
}

export async function insertEdgeAlg(algObject){
   const response = await axios.post(`${BLDDB}/Edges`, algObject);
   return response.data;
}

export async function getCornerAlgs(buffer, first, second) {
   const response = await axios.get(`${BLDDB}/Corners?buffer=${buffer}&first=${first}&second=${second}`);
   return response;
}

export async function getCornerAlgById(id) {
   const response = await axios.get(`${BLDDB}/Corners/${id}`);
   return response;
}
    
export async function insertCornerAlg(algObject){
   const response = await axios.post(`${BLDDB}/Corners`, algObject);
   return response.data;
}

export async function getParityAlgs(firstEdge, secondEdge, firstCorner, secondCorner, twist) {
   const url =
     `${BLDDB}/Parity` +
     `?firstEdge=${firstEdge}` +
     `&secondEdge=${secondEdge}` +
     `&firstCorner=${firstCorner}` +
     `&secondCorner=${secondCorner}` +
     `&twist=${twist ?? ""}`;
 
   const response = await axios.get(url);
   console.log(response);
   return response;
 }

export async function getParityAlgById(id) {
   const response = await axios.get(`${BLDDB}/Parity/${id}`);
   return response;
}

export async function insertParityAlg(algObject){
   const response = await axios.post(`${BLDDB}/Parity`, algObject);
   return response.data;
}

export async function importAlgs(algorithms){
   const response = await axios.post(`${BLDDB}/Import`, algorithms, {
      headers: {
         'Content-Type': 'application/json'
      }
   })
   return response?.data;
}