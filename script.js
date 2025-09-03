document.addEventListener("DOMContentLoaded", function () {
  const searchButton = document.getElementById("search-btn");
  const compareButton = document.getElementById("compare-btn");
  const usernameInput = document.getElementById("user-input");
  const user1Input = document.getElementById("user1-input");
  const user2Input = document.getElementById("user2-input");

  const statsContainer = document.querySelector(".stats-container");
  const compareResult = document.querySelector(".compare-result");
  const easyLabel = document.getElementById("easy-label");
  const mediumLabel = document.getElementById("medium-label");
  const hardLabel = document.getElementById("hard-label");
  const easyCircle = document.querySelector(".easy-progress");
  const mediumCircle = document.querySelector(".medium-progress");
  const hardCircle = document.querySelector(".hard-progress");
  const cardStatsContainer = document.querySelector(".stats-cards");
  const acceptanceBar = document.getElementById("acceptance-bar");
  const acceptanceText = document.getElementById("acceptance-rate-text");
  const compareCards = document.getElementById("compare-cards");

  const singleUserSection = document.getElementById("single-user-section");
  const compareUserSection = document.getElementById("compare-user-section");

  const modeRadios = document.getElementsByName("mode");

  const URL = "https://leetcode-stats.tashif.codes/";

  // Switch mode (Display or Compare)
  modeRadios.forEach(radio => {
    radio.addEventListener("change", () => {
      const mode = document.querySelector('input[name="mode"]:checked').value;
      if (mode === "single") {
        singleUserSection.classList.remove("hidden");
        compareUserSection.classList.add("hidden");
        compareResult.classList.add("hidden");
      } else {
        singleUserSection.classList.add("hidden");
        compareUserSection.classList.remove("hidden");
        statsContainer.classList.add("hidden");
      }
    });
  });

  function validateUsername(username) {
    if (!username.trim()) {
      alert("Username cannot be empty");
      return false;
    }
    const regex = /^[a-zA-Z0-9_-]{1,20}$/;
    if (!regex.test(username)) {
      alert("Invalid username format");
      return false;
    }
    return true;
  }

  async function fetchUserStats(username) {
    const res = await fetch(URL + username);
    if (!res.ok) throw new Error(`User ${username} not found`);
    return await res.json();
  }

  function updateProgress(solved, total, label, circle) {
    const percent = total > 0 ? (solved / total) * 100 : 0;
    const degrees = (percent / 100) * 360;
    circle.style.setProperty("--progress-degree", `${degrees}deg`);
    label.textContent = `${solved}/${total}`;
  }

  searchButton.addEventListener("click", async () => {
    const username = usernameInput.value.trim();
    if (!validateUsername(username)) return;

    try {
      searchButton.disabled = true;
      searchButton.textContent = "Loading...";
      const data = await fetchUserStats(username);

      statsContainer.classList.remove("hidden");
      compareResult.classList.add("hidden");

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

      acceptanceBar.style.width = `${data.acceptanceRate}%`;
      acceptanceText.textContent = `Acceptance Rate: ${data.acceptanceRate}%`;
    } catch (err) {
      alert(err.message);
      statsContainer.classList.add("hidden");
    } finally {
      searchButton.disabled = false;
      searchButton.textContent = "Search";
    }
  });

  compareButton.addEventListener("click", async () => {
    const user1 = user1Input.value.trim();
    const user2 = user2Input.value.trim();
    if (!validateUsername(user1) || !validateUsername(user2)) return;

    try {
      compareButton.disabled = true;
      compareButton.textContent = "Comparing...";

      const [data1, data2] = await Promise.all([
        fetchUserStats(user1),
        fetchUserStats(user2)
      ]);

      statsContainer.classList.add("hidden");
      compareResult.classList.remove("hidden");

      const comparison = [
        {
          label: "Total Solved",
          u1: data1.totalSolved,
          u2: data2.totalSolved
        },
        {
          label: "Ranking",
          u1: data1.ranking,
          u2: data2.ranking
        },
        {
          label: "Contribution Points",
          u1: data1.contributionPoints,
          u2: data2.contributionPoints
        },
        {
          label: "Acceptance Rate (%)",
          u1: data1.acceptanceRate,
          u2: data2.acceptanceRate
        },
        {
          label: "Easy",
          u1: data1.easySolved + "/" + data1.totalEasy,
          u2: data2.easySolved + "/" + data2.totalEasy
        },
        {
          label: "Medium",
          u1: data1.mediumSolved + "/" + data1.totalMedium,
          u2: data2.mediumSolved + "/" + data2.totalMedium
        },
        {
          label: "Hard",
          u1: data1.hardSolved + "/" + data1.totalHard,
          u2: data2.hardSolved + "/" + data2.totalHard
        }
      ];

      compareCards.innerHTML = comparison.map(row => `
        <div class="card">
          <h4>${row.label}</h4>
          <p><strong>${user1}:</strong> ${row.u1}</p>
          <p><strong>${user2}:</strong> ${row.u2}</p>
        </div>
      `).join("");
    } catch (err) {
      alert(err.message);
      compareResult.classList.add("hidden");
    } finally {
      compareButton.disabled = false;
      compareButton.textContent = "Compare";
    }
  });
});

