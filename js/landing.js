document.addEventListener('DOMContentLoaded', function() {
  // Get reference to the enter button
  const enterButton = document.querySelector('.enter-button');
  const landingPage = document.getElementById('landing-page');
  const alienDashboard = document.getElementById('alien-dashboard');
  
  // Function to transition from landing page to dashboard
  function startExperience() {
    landingPage.classList.add('fade-out');
    
    setTimeout(function() {
      landingPage.classList.add('hidden');
      alienDashboard.classList.remove('hidden');
      alienDashboard.classList.add('fade-in');
      
      // Start mission timer if it exists
      if (typeof startMissionTimer === 'function') {
        startMissionTimer();
      }
    }, 1000);
  }
  
  // Add click event listener to the enter button
  enterButton.addEventListener('click', function() {
    startExperience();
  });
  
  // Also keep keyboard functionality
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !landingPage.classList.contains('hidden')) {
      startExperience();
    }
  });
});
