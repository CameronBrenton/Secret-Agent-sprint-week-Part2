const Pool = require('pg').Pool
const pool = new Pool({
    user: 'sprint',
    host: 'localhost',
    database: "sprintDatabase",
    password: "password",
    port: 5432
});

const postMessageStack = async (request, response) => {
    const { data, agentid, structureid } = request.body

    pool.query(`INSERT INTO agent (data, agentid, structureid) VALUES ($1, $2, $3)`, [data, agentid, structureid], (error, results) => {
        if (error) {
            console.log('ERROR: Could not complete query')
            throw error
        } else {
            response.status(201).json("An agent order has successfully been created!");
            console.log('An agent order has successfully been created into the stack!')
        }
    });
};

const getMessageStack = (request, response) => {
    const { agentid, structureid } = request.body

    pool.query(`SELECT * FROM agent WHERE agentid = $1 AND structureid = $2 AND popped = 'false' ORDER BY id DESC LIMIT 1`, [agentid, structureid], (error, results) => {
        if (error) {
            throw error
        } else {
            response.status(200).json(`Hello agent! These are your orders:  ${JSON.stringify(results.rows[0].data)}`);
            console.log(`Hello agent! These are your orders:  ${JSON.stringify(results.rows[0].data)}`)
            
            pool.query(`SELECT MIN(id) FROM agent WHERE structureid = $1 AND agentid = $2 AND popped = 'false'`, [structureid, agentid], (error, results) => {
                if (error) {
                    console.log('ERROR: Could not complete query')
                    throw error
                } else {
                    let minid = results.rows[0].min

                    pool.query(`UPDATE agent SET popped = 'true' WHERE id = ${minid} `, (error, results) => {
                        if (error) {
                            console.log('ERROR: Could not complete query')
                            throw error
                        } else {
                            console.log(`The Popped record in the stackhas successfully been updated`);

                            pool.query(`UPDATE agent SET retriever = $1 WHERE id = ${minid} `, [agentid], (error, results) => {
                                if (error) {
                                    console.log('ERROR: Could not complete query')
                                    throw error
                                } else {
                                    console.log(`The Retriever record in the stack has successfully been updated`);
                                };
                            });
                        };
                    });
                };
            });
        };
    });
};

const postMessageQueue = async (request, response) => {
    const { data, agentid, structureid } = request.body
    pool.query(`INSERT INTO agentque (data, agentid, structureid) VALUES ($1, $2, $3)`, [data, agentid, structureid], (error, results) => {
        if (error) {
            console.log('ERROR: Could not complete query')
            throw error
        } else {
            response.status(201).json("An agent order has successfully been created!");
            console.log('An agent order has successfully been created into the queue!');
        }
    });
};
      
const getMessageQueue = (request, response) => {
    const { agentid, structureid } = request.body

    pool.query(`SELECT * FROM agentque WHERE agentid = $1 AND structureid = $2 AND dequeue = 'false' ORDER BY id DESC LIMIT 1`, [agentid, structureid], (error, results) => {
        if (error) {
            throw error
        } else {
            response.status(200).json(`Hello agent! These are your orders:  ${JSON.stringify(results.rows[0].data)}`);
            console.log(`Hello agent! These are your orders:  ${JSON.stringify(results.rows[0].data)}`)
            
            pool.query(`SELECT MAX(id) FROM agentque WHERE structureid = $1 AND agentid = $2 AND dequeue = 'false'`, [structureid, agentid], (error, results) => {
                if (error) {
                    console.log('ERROR: Could not complete query')
                    throw error
                } else {
                    let maxid = results.rows[0].max

                    pool.query(`UPDATE agentque SET dequeue = 'true' WHERE id = ${maxid} `, (error, results) => {
                        if (error) {
                            console.log('ERROR: Could not complete query')
                            throw error
                        } else {
                            console.log(`The Dequeue record in the queue has successfully been updated`);

                            pool.query(`UPDATE agentque SET retriever = $1 WHERE id = ${maxid} `,[agentid], (error, results) => {
                                if (error) {
                                    console.log('ERROR: Could not complete query')
                                    throw error
                                } else {
                                    console.log(`The Retriever record in the queue has successfully been updated`);
                                };
                            });
                        };
                    });
                };
            });
        };
    });
};

const getAllMessagesPostedByAgentId = (request, response) => { 
    const { agentid } = request.body
     
    pool.query(`SELECT * FROM agent FULL JOIN agentque ON agent.id = agentque.id`, (error, results) => {
        if (error) {
            console.log('ERROR: Could not complete query')
            throw error
        } else {
            let messages = []
            let i;
            for ( i = 0; i < results.rowCount;i++){
                messages.push(results.rows[i]);
            };          
            response.status(200).json(messages);   
            console.log("Hello agent! These are all the messages posted across all queues and stacks based on agentid ")
            console.log(messages)
        }
    });
};

const getAllMessagesRetrievedByAgentId = (request, response) => { 
    const { agentid } = request.body
        
    pool.query(`SELECT * FROM agent LEFT JOIN agentque ON agent.agentid = agentque.agentid`, (error, results) => {
        if (error) {
            console.log('ERROR: Could not complete query')
            throw error
        } else {
            response.status(200).json(results.rows);   
            console.log("Hello agent! These are all the messages retrieved relating to the agentid")
            console.log(results.rows)
        }
    });
};

const getStackMessagesPostedByStructureId = (request, response) => { 
    const { structureid } = request.body
        
    pool.query(`SELECT data FROM agent WHERE structureid = $1`, [structureid], (error, results) => {
        if (error) {
            console.log('ERROR: Could not complete query')
            throw error
        } else {
            response.status(200).json(results.rows);   
            console.log("Hello agent! These are all the messages in the stack relating to the structureid")
            console.log(results.rows)
        }
    });
};

const getQueueMessagesPostedByStructureId = (request, response) => { 
    const { structureid } = request.body
        
    pool.query(`SELECT data FROM agentque WHERE structureid = $1`, [structureid], (error, results) => {
        if (error) {
            console.log('ERROR: Could not complete query')
            throw error
        } else {
            response.status(200).json(results.rows);   
            console.log("Hello agent! These are all the messages in the stack relating to the structureid")
            console.log(results.rows)
        }
    });
};

module.exports = {
    postMessageStack,
    getMessageStack,
    postMessageQueue,
    getMessageQueue,
    getAllMessagesPostedByAgentId,
    getAllMessagesRetrievedByAgentId,
    getStackMessagesPostedByStructureId,
    getQueueMessagesPostedByStructureId
};
