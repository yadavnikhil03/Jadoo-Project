function onLoad(arg) {
  document.addEventListener("keydown", function(e) {
    if (e.keyCode === 13) {
      toggleFullScreen();
    }
  });

  //key press event listner
  window.addEventListener('keydown', function(e) {
    const promptKeys = [66, 67, 68, 69, 70]; // Key codes for B, C, D, E, F
    if (promptKeys.includes(e.keyCode)) {
      const imageSource = 'https://cdn.statically.io/img/www.blogson.com.br/wp-content/uploads/2017/10/584b607f5c2ff075429dc0e7b8d142ef.gif'; // image URL
      displayReceivedImage(imageSource);
    }
  });
}

function displayReceivedImage(imageSrc) {
  const receivedImage = document.getElementById("receivedImage");
  receivedImage.src = imageSrc;
  receivedImage.classList.remove('nodisplay');
}


function toggleFullScreen() {
  // Request full screen mode
  function launchIntoFullscreen(element) {
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.mozRequestFullScreen) {
      element.mozRequestFullScreen();
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen();
    } else if (element.msRequestFullscreen) {
      element.msRequestFullscreen();
    }
  }

  if (!document.fullscreenElement) {
    launchIntoFullscreen(document.documentElement);
  }

  // Changing background color
  document.querySelector('#monitor').style.backgroundColor = "#000000";

  // Show hidden elements and hide others
  const nodisplays = document.querySelectorAll('.nodisplay');
  nodisplays.forEach(nodisplay => nodisplay.classList.remove('nodisplay'));

  // Hide specific elements
  document.querySelector('.enter-text').classList.add('nodisplay');
  document.querySelector('.background-image').classList.add('nodisplay');

  // Update prompt key content
  const promptKey = document.querySelector('.prompt-key');
  promptKey.innerHTML = "B C F E";
  promptKey.innerHTML += "\tB C E D";
  promptKey.innerHTML += "\tB C F E D C";
}

