  var now = new Date();
  var y = now.getFullYear();
  var m = now.getMonth() + 1;
  var d = now.getDate();

  //月と日は0埋めを行う
  m = m < 10 ? "0" + m : m;
  d = d < 10 ? "0" + d : d;

  //yyyy-mm-dd形式
  document.querySelector("input[id=endDate]").value = y + "-" + m + "-" + d;
  document.querySelector("input[id=startDate]").value = y + "-" + m + "-" + d;
  const fields = ["#ope1","#ope2","#ope3", "#ope4","#ope5","#ope6","#ope7","#ope8","#ope9","#ope10","#ope11","#hhe1","#hhe2","#hhe3", "#hhe4","#hhe5","#hhe6","#hhe7","#hhe8","#hhe9","#hhe10","#hhe11","#lhe1","#lhe2","#lhe3", "#lhe4","#lhe5","#lhe6","#lhe7","#lhe8","#lhe9","#lhe10","#lhe11","#oru1","#oru2","#oru3", "#oru4","#oru5","#oru6","#oru7","#oru8","#oru9","#oru10","#oru11","#ore1","#ore2","#ore3", "#ore4","#ore5","#ore6","#ore7","#ore8","#ore9","#ore10","#ore11"];
  const mission = ["#dailyMission","#weeklyMission"];
  const certStore = ["#t1green","#t2green","#supplies","#orugreen"];
  const monthlyNum = ["#useMonthlyCard", "#includeBonusOp"];
  let fieldsValue = [];
  let totalOrundum = 0;
  function updateDate() {
    var start = new Date(document.getElementById("startDate").value);
    var end = new Date(document.getElementById("endDate").value);
    var timeDiff = end.getTime() - start.getTime();
    let daysDiff = 0;
    if (timeDiff<0) {
      document.querySelector("input[id=elapsedDays]").value = 0;
      return 0;
    }
    daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    document.querySelector("input[id=elapsedDays]").value = daysDiff;
  }
  function updateMonthly() {
      if ($('#useMonthlyCard').is(":checked")) {
        let days = parseInt($('#elapsedDays').val());
        document.querySelector("input[id=monthlyCardsUsed]").value = Math.ceil(days/30);
        $("#includeBonusOp").prop('disabled', false);
      }
      else {
        document.querySelector("input[id=monthlyCardsUsed]").value = 0;
        $("#includeBonusOp").prop('disabled', true);
        $("#includeBonusOp").prop('checked', false);
      }

  }
  function calculateIT() {
    updateDate();
    updateMonthly();
    totalOrundum = 0;
    let daysF = parseInt($("#elapsedDays").val())
    //annihilation
    totalOrundum += parseInt($("#annihilation").val())*Math.floor(daysF/7);
    // mission calculation
    for (var i = 0; i < mission.length; i++) {
      if ($(mission[i].length)) {
        if ($(mission[i]).is(":checked")) {
          let temp = parseInt($(mission[i]).val())*Math.floor(daysF/7);
          totalOrundum+= temp;
        }
      }
    }
    //store calculation
    for (var i = 0; i < certStore.length; i++) {
      if ($(certStore[i].length)) {
        if ($(certStore[i]).is(":checked")) {
          let temp = parseInt($(certStore[i]).val())*Math.floor(daysF/30);
          totalOrundum+= temp;
        }
      }
    }
    if ($(monthlyNum[0]).is(":checked")) {
      totalOrundum += daysF*200;
    }
    if ($(monthlyNum[1]).is(":checked")) {
      totalOrundum += parseInt($("#monthlyCardsUsed").val())*6*180;
    }
    // event calculation
    for (let i = 0; i < fields.length; i++) {
        fieldsValue[i] = 0;
        if ($(fields[i]).length) {
          if (($(fields[i]).is(":checked"))) {
             fieldsValue[i] = parseInt($(fields[i]).val());
             totalOrundum += fieldsValue[i];
          }
        }
      }
      totalOrundum += (parseInt($("#op").val())*180) + (parseInt($("#orundum").val())) - (parseInt($("#reserveOP").val()*180));
      let estimatedPulls = Math.floor(totalOrundum/600) + parseInt($("#hhTicket").val());
      if (isNaN(estimatedPulls)) {
        $("#resultView").html("<h2>Error</h2>");
      }
      else{
        $("#resultView").html("<h2>Your Estimated Pulls: "+estimatedPulls+"</h2>");
      }
  }