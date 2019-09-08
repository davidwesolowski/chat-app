var socket = io();

//  Elements

const $messageForm = document.querySelector('#message-form');
const $messageFormInput = document.querySelector('input');
const $messageFormButton = document.querySelector('button');
const $locationButton = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');
const $sidebarMessage = document.querySelector('#sidebar');

//  Templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true });

const autoscroll = () =>
{
    const newMessage = $messages.lastElementChild;
    const newMessageStyle = getComputedStyle(newMessage);
    const newMessageMargin = parseInt(newMessageStyle.marginBottom);
    const newMessageHeight = newMessage.offsetHeight + newMessageMargin;
    const visibleHeight = $messages.offsetHeight;
    const containerHeight = $messages.scrollHeight;
    const scrollOffset = $messages.scrollTop + visibleHeight;

    if (containerHeight - newMessageHeight <= scrollOffset)
    {
        $messages.scrollTop = containerHeight;
    }
   
};

socket.on('message', (msg) =>
{
    console.log(msg);
    const html = Mustache.render(messageTemplate,
    {
        username: msg.username,
        message: msg.msg,
        createdAt: moment(msg.createdAt).format('h:mm:ss a')
    });
    $messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
})

socket.on('locationMessage', (url) =>
{
    const html = Mustache.render(locationTemplate, 
    {
        username: url.username,
        urlLocation: url.msg,
        createdAt: moment(url.createdAt).format('h:mm:ss a')
    });
    $messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
});

$messageForm.addEventListener('submit', (event) =>
{
    event.preventDefault();
    let msg = event.target.elements.msgValue.value;

    $messageFormButton.setAttribute('disabled', 'disabled');
    $messageFormInput.value = '';
    $messageFormInput.focus();

    socket.emit('sendMsg', msg, (msgAck) =>
    {
        $messageFormButton.removeAttribute('disabled');
    });
});

$locationButton.addEventListener('click', () =>
{
    if (!navigator.geolocation)
    {
        return alert('Gegolocation is not supported by your broweser.');
    }

    navigator.geolocation.getCurrentPosition((position) =>
    {
        $locationButton.setAttribute('disabled', 'disabled');
        socket.emit('sendLocation', 
        {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, (msgAck) =>
        {
            $locationButton.removeAttribute('disabled');
            console.log(msgAck);
        })
    });

});

socket.on('roomData', ({ room, usersInRoom }) =>
{
    const html = Mustache.render(sidebarTemplate,
    {
        room,
        usersInRoom
    });
    $sidebarMessage.innerHTML = html;
});


socket.emit('join', { username, room }, (error) =>
{
    if (error)
    {
        alert(error);
        location.href = "/";
    }
    
});