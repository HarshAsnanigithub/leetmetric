document.addEventListener("DOMContentLoaded", function () {
  const searchButton = document.getElementById("search-btn");
  const usernameInput = document.getElementById("user-input");
  const statsContainer = document.querySelector(".stats-container");
  const easyLabel = document.getElementById("easy-label");
  const mediumLabel = document.getElementById("medium-label");
  const hardLabel = document.getElementById("hard-label");
  const easyCircle = document.querySelector(".easy-progress");
  const mediumCircle = document.querySelector(".medium-progress");
  const hardCircle = document.querySelector(".hard-progress");
  const cardStatsContainer = document.querySelector(".stats-cards");
  const acceptanceBar = document.getElementById("acceptance-bar");
  const acceptanceText = document.getElementById("acceptance-rate-text");

  const URL = `https://leetcode-stats-api.herokuapp.com/`;

  function validateUsername(username) {
    if (username.trim() === "") {
      alert("Username should not be empty");
      return false;
    }
    const regex = /^[a-zA-Z0-9_-]{1,20}$/;
    if (!regex.test(username)) {
      alert("Invalid username format");
      return false;
    }
    return true;
  }

  async function show(username) {
    try {
      searchButton.disabled = true;
      searchButton.textContent = "Loading...";

      const response = await fetch(URL + username);
      if (!response.ok) throw new Error("User not found");

      const data = await response.json();

      // Display stats container
      statsContainer.classList.remove("hidden");

      // Set problem data
      updateProgress(data.easySolved, data.totalEasy, easyLabel, easyCircle);
      updateProgress(data.mediumSolved, data.totalMedium, mediumLabel, mediumCircle);
      updateProgress(data.hardSolved, data.totalHard, hardLabel, hardCircle);

      const cardsData = [
        { label: "Total Questions Solved", value: data.totalSolved },
        { label: "Easy Submissions", value: data.totalEasy },
        { label: "Medium Submissions", value: data.totalMedium },
        { label: "Hard Submissions", value: data.totalHard },
        { label: "Ranking", value: data.ranking },
        { label: "Contribution Points", value: data.contributionPoints }
      ];

      cardStatsContainer.innerHTML = cardsData.map(card => `
        <div class="card">
          <h4>${card.label}</h4>
          <p>${card.value}</p>
        </div>
      `).join("");

      // Acceptance Rate
      const totalSubmissions = data.totalSubmissionNum || 0;
      const totalSolved = data.totalSolved || 0;
      const rate = totalSubmissions > 0
        ? ((totalSolved / totalSubmissions) * 100).toFixed(2)
        : 0;

      acceptanceBar.style.width = `${data.acceptanceRate}%`;
      acceptanceText.textContent = `Acceptance Rate: ${data.acceptanceRate}%`;
    } catch (err) {
      alert(err.message);
      statsContainer.classList.add("hidden");
      cardStatsContainer.innerHTML = "";
      acceptanceBar.style.width = "0%";
      acceptanceText.textContent = "";
      easyLabel.textContent = "";
      mediumLabel.textContent = "";
      hardLabel.textContent = "";
      easyCircle.style.setProperty("--progress-degree", "0deg");
      mediumCircle.style.setProperty("--progress-degree", "0deg");
      hardCircle.style.setProperty("--progress-degree", "0deg");
    } finally {
      searchButton.disabled = false;
      searchButton.textContent = "Search";
    }
  }

  function updateProgress(solved, total, label, circle) {
    const percent = total > 0 ? (solved / total) * 100 : 0;
    const degrees = (percent / 100) * 360;
    circle.style.setProperty("--progress-degree", `${degrees}deg`);
    label.textContent = `${solved}/${total}`;
  }

  searchButton.addEventListener("click", () => {
    const username = usernameInput.value.trim();
    if (validateUsername(username)) {
      show(username);
    }
  });
});
