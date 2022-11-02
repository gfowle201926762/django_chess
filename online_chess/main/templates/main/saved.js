const chess_room_name = JSON.parse(document.getElementById('chess-room-name').textContent)
    const url = 'ws://' + window.location.host + '/ws/chess_room/' + chess_room_name + '/'
    const chess_room_socket = new WebSocket(url)

    chess_room_socket.onmessage = function(event){
        const data = JSON.parse(event.data).message
        console.log(`[RECEIVING MESSAGE:] ${data}`)
    }

    const form = document.getElementById('form')
    form.addEventListener('submit', (event)=>{
        event.preventDefault()
        var message = event.target.text.value
        console.log(`[SENDING MESSAGE:] ${message}`)
        chess_room_socket.send(JSON.stringify({
            'message': message
        }))

        form.reset()
    })



    <p>This is a chess room{{chess_room_name}}</p>

    <form id='form'>
        <input type='text' name='text'/>
    </form>

    {{chess_room_name|json_script:'chess-room-name'}}







    <p>This is the home page</p>
    <form id='chess_room_form'>
        <input type='text' name='chess_room_input'/>
        <input type='submit' id='chess_room_submit'/>
    </form>










    <form method='GET' action="{%url 'profile_search'%}" class='nav_form nav_button'>
        <input type='text' size='7' placeholder='search profiles' name='query' value="{{request.GET.query}}"/>
        <button type='submit'></button>
      </form>

      

      const search_button = document.getElementById('profile_search')
    search_button.addEventListener('click', handle_search)

    function handle_search(event){
      const search_form = document.createElement('form')
      search_form.method = 'GET'
      search_form.action = "{%url 'profile_search'%}"

    }










    <div class='login_screen'>
        <p>login page</p>
        <form method='POST'>
            {% csrf_token %}
            {{form | crispy}}
            <input type='submit'></input>
        </form>
      </div> 


      {{id_username|json_script:'id-username'}}
      {{id_email|json_script:'id-email'}}
      {{id_password1|json_script:'id-password1'}}
      {{id_password2|json_script:'id-password2'}}