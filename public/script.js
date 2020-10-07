//(function() {
  const socket = io('/');  
  const videoGrid = document.getElementById('video-grid');
  const myVideo = document.createElement('video');
  myVideo.muted = true;

  const peer = new Peer(undefined, {
    path: '/peerjs',
    host: '/',
    port: '3030'
  });

  let myVideoStream;

  //Allow to access video and audio
  navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true    
  }).then(stream => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);
    
    //Listen Answer this call
    peer.on('call', call => {
      //Answer call
      call.answer(stream);
      const video = document.createElement('video');
      call.on('stream', userVideoStream => {
        addVideoStream(video, userVideoStream);
      });
    });

    //Listen to user-connected event that throws from server
    socket.on('user-connected', (userId) => {
      connectToNewUser(userId, stream);
    });

    let text = $('input');

    $('html').keydown(e => {
      if (e.which == 13 && text.val().length !== 0) {
        console.log(text.val());
        //Send message
        socket.emit('message', text.val());
        text.val('');
      }
    });
    
    //Listen to createMessage
    socket.on('createMessage', message => {
      console.log('this is comming from server ', message);
      $('.messages').append(`<li class="message"><b>user</b><br/>${message}</li>`);

      scrollToBottom();
    });
  });

  //Open connection with peer and we get a UNIQUE ID and it is generated automatically
  peer.on('open', id => {
    //It will join to room based on room id and unique id
    socket.emit('join-room', ROOM_ID, id);
  })

  const connectToNewUser = (userId, stream) => {
    //CALL a peer, providing userId and stream
    const call = peer.call(userId, stream);
    //Create video element
    const video = document.createElement('video');
    
    //Someone is calling and add video 
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream); 
    });
  }; 

  const addVideoStream = (video, stream) => {
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    })
    videoGrid.append(video);
  };

  const scrollToBottom = () => {
    const mainChatWindow = $('.main__chat_window');
    mainChatWindow.scrollTop(mainChatWindow.prop('scrollHeight'));
  };

  //Mute or video
  const muteUnmute = () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled) {
      myVideoStream.getAudioTracks()[0].enabled = false;
      //It will update the icon
      setUnmuteButton();
    } else {
      //It will update the icon
      setMuteButton();
      myVideoStream.getAudioTracks()[0].enabled = true;
    }
  };

  const setMuteButton = () => {
    const html = `
      <i class="fas fa-microphone"></i>
      <span>Mute</span>
    `;
    document.querySelector('.main__mute_button').innerHTML = html;
  };

  const setUnmuteButton = () => {
    const html = `
      <i class="unmute fas fa-microphone-slash"></i>
      <span>Unmute</span>
    `;
    document.querySelector('.main__mute_button').innerHTML = html;
  };

  const playStop = () => {
    let enabled = myVideoStream.getVideoTracks()[0].enabled;

    if (enabled) {
      myVideoStream.getVideoTracks()[0].enabled = false;
      setPlayVideo();
    } else {
      setStopVideo();
      myVideoStream.getVideoTracks()[0].enabled = true;
    }
  };

  const setStopVideo = () => {
    const videoButton = `
      <i class="fas fa-video"></i>
      <span>Stop Video</span>
    `;
    
    document.querySelector('.main__video_button').innerHTML = videoButton;
  };

  const setPlayVideo = () => {
    const html =  `
      <i class="stop fas fa-video-slash"></i>
      <span>Play Video</span>
    `;

    document.querySelector('.main__video_button').innerHTML = html;
  };
//})();
