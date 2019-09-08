const generateMessage = (username, text) =>
{
    return {
        username,
        msg: text,
        createdAt: new Date().getTime()
    };
};

const generateLocationMessage = (username, url) =>
{
    return {
        username,
        msg: url,
        createdAt: new Date().getTime()
    }
};

module.exports = 
{
    generateMessage,
    generateLocationMessage
};