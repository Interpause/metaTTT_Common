let g = null;
try{g = window}
catch(e){}
try{g = global}
catch(e){}
g.gen_uuid = c => ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16));
g.wait = ms => new Promise((r, j)=>setTimeout(r, ms));