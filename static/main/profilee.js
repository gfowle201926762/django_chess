console.log("PROFILE")


const url = 'wss://' + window.location.host + '/ws/notifications/'
const notification_socket = new WebSocket(url)

const self_profile_pk = JSON.parse(document.getElementById('self_profile_pk').textContent)

const count = JSON.parse(document.getElementById('count').textContent)
if (count > 0){
    const notification_count = document.getElementById('notification_count')
    notification_count.style.display = 'block'
    notification_count.classList.add('notification_count')
}


notification_socket.onmessage = function(event){
    console.log('received a message...')

    const data = JSON.parse(event.data)

    if (data.type == 'first_connection'){
        notification_socket.send(JSON.stringify({
            'type': 'connecting_room',
            'message': self_profile_pk
        }))
    }

    if (data.type == 'notification_sent'){
        console.log('notification sent in JS!')
        const notification_count = document.getElementById('notification_count')
        notification_count.innerHTML = data.count
        notification_count.style.display = 'block'
        notification_count.classList.add('notification_count')
    }
}
