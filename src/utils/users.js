const users = [];

const addUser = ({ id, username, room }) =>
{
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    if (!username || !room)
    {
        return {
            error: 'User or room is required!'
        };
    }

    const existingUser = users.find((user) =>
    {
        return user.username === username && user.room === room;
    });

    if (existingUser)
    {
        return {
            error: 'User is in use'
        };
    }

    const user = { id, username, room };

    users.push(user);

    return { user };

};

const removeUser = (id) =>
{
    const indexToRemove = users.findIndex((user) => user.id === id);

    if (indexToRemove != -1)
    {
        return users.splice(indexToRemove, 1)[0];
    }
};

const getUser = (id) =>
{
    const userToGet = users.find((user) => user.id === id);
    // if (!userToGet)
    // {
    //     return {
    //         error: 'User does not exist'
    //     };
    // }

    return userToGet;
};

const getUsersInRoom = (room) =>
{
    const usersInRoom = users.filter((user) => user.room === room);
    if (usersInRoom.length === 0)
    {
        return {
            error: 'No user is in this room'
        }
    }

    return usersInRoom;
};


module.exports = 
{
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
};