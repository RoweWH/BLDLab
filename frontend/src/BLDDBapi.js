import axios from 'axios';

const BLDDB = 'https://rowewh.com/api';

export async function getEdgeAlgs(first, second, third){
   const response = await axios.get(`${BLDDB}/Edges/edge1=${first}&edge2=${second}&edge3=${third}`);
   return response.data;
}

export async function insertEdgeAlg(algObject){
   const response = await axios.post(`${BLDDB}/Edges/PostAlgorithmByCase`, algObject);
   return response.data;
}

export async function getCornerAlgs(first, second, third){
   const response = await axios.get(`${BLDDB}/Corners/corner1=${first}&corner2=${second}&corner3=${third}`);
   return response.data;
}
    
export async function insertCornerAlg(algObject){
   const response = await axios.post(`${BLDDB}/Corners/PostAlgorithmByCase`, algObject);
   return response.data;
}

export async function getParityAlgs(firstEdge, secondEdge, firstCorner, secondCorner, twist){
   
   const response = await axios.get(`${BLDDB}/Parity?edge1=${firstEdge}&edge2=${secondEdge}&corner1=${firstCorner}&corner2=${secondCorner}&twist=${twist === null ? '' : twist}`);
   return response.data;
}

export async function insertParityAlg(algObject){
   const response = await axios.post(`${BLDDB}/Parity/PostAlgorithmByCase`, algObject);
   return response.data;
}

export async function importAlgs(algorithms){
   const response = await axios.post(`${BLDDB}/Import/ImportAlgorithms`, algorithms);
   return response.data;
}