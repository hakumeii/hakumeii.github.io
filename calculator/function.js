// Set default start and end dates to today (yyyy-mm-dd)
const now = new Date();
const y = now.getFullYear();
const m = String(now.getMonth() + 1).padStart(2, "0");
const d = String(now.getDate()).padStart(2, "0");
const today = `${y}-${m}-${d}`;

document.querySelector("#endDate").value = today;
document.querySelector("#startDate").value = today;

const mission = ["#dailyMission", "#weeklyMission"];
const certStore = ["#t1green", "#t2green", "#supplies", "#orugreen"];
const monthlyNum = ["#useMonthlyCard", "#includeBonusOp"];

let totalOrundum = 0;

// --- Utility functions ---

function getDaysBetween(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = end - start;
  return diff < 0 ? 0 : Math.ceil(diff / (1000 * 3600 * 24));
}

function updateDate() {
  const startDate = $("#startDate").val();
  const endDate = $("#endDate").val();
  const daysDiff = getDaysBetween(startDate, endDate);
  $("#elapsedDays").val(daysDiff);
  return daysDiff;
}

function updateMonthly(days) {
  if ($("#useMonthlyCard").is(":checked")) {
    const used = Math.ceil(days / 30);
    $("#monthlyCardsUsed").val(used);
    $("#includeBonusOp").prop("disabled", false);
  } else {
    $("#monthlyCardsUsed").val(0);
    $("#includeBonusOp").prop({ disabled: true, checked: false });
  }
}

function addCheckedValue(selectors, multiplier = 1) {
  let total = 0;
  selectors.forEach(sel => {
    const $el = $(sel);
    if ($el.length && $el.is(":checked")) {
      total += parseInt($el.val()) * multiplier;
    }
  });
  return total;
}
    // Function to calculate total of all checked items
    function calculateevent() {
      const checked = document.querySelectorAll("#eventDetail input:checked");
      let total = 0;
      checked.forEach(el => {
        total += parseInt(el.value, 10) || 0;
      });
      return total;
    }


// --- Main calculation function ---

function calculateIT() {
  const days = updateDate();
  updateMonthly(days);
  totalOrundum = 0;

  // Weekly annihilation
  totalOrundum += parseInt($("#annihilation").val()) * Math.floor(days / 7);

  // Missions
  totalOrundum += $("#dailyMission").is(":checked") ? parseInt($("#dailyMission").val()) * days : 0;
  totalOrundum += $("#weeklyMission").is(":checked") ? parseInt($("#weeklyMission").val()) * Math.floor(days / 7) : 0;

  // Store rewards (monthly)
  totalOrundum += addCheckedValue(certStore, Math.floor(days / 30));

  // Monthly card bonuses
  if ($("#useMonthlyCard").is(":checked")) totalOrundum += days * 200;
  if ($("#includeBonusOp").is(":checked")) totalOrundum += parseInt($("#monthlyCardsUsed").val()) * 6 * 180;

  // Event fields
  totalOrundum += calculateevent();

  // Manual inputs
  totalOrundum +=
    (parseInt($("#op").val()) * 180) +
    parseInt($("#orundum").val()) -
    (parseInt($("#reserveOP").val()) * 180);

  // Final pulls
  const estimatedPulls = Math.floor(totalOrundum / 600) + parseInt($("#hhTicket").val());

  $("#resultView").html(
    isNaN(estimatedPulls)
      ? "<h2>Error</h2>"
      : `<h2>Your Estimated Pulls: ${estimatedPulls}</h2>`
  );
}
