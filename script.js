function addStudent() {

    let name = document.getElementById("name").value;
    let reg = document.getElementById("regno").value;

    let m1 = parseInt(document.getElementById("m1").value);
    let m2 = parseInt(document.getElementById("m2").value);
    let m3 = parseInt(document.getElementById("m3").value);

    if (name === "" || reg === "" || isNaN(m1) || isNaN(m2) || isNaN(m3)) {
        alert("Please fill all the fields.");
        return;
    }

    let total = m1 + m2 + m3;
    let average = (total / 3).toFixed(2);

    let grade = "";

    if (average >= 90)
        grade = "A+";
    else if (average >= 80)
        grade = "A";
    else if (average >= 70)
        grade = "B";
    else if (average >= 60)
        grade = "C";
    else if (average >= 50)
        grade = "D";
    else
        grade = "Fail";

    let table = document.getElementById("resultTable");

    let row = table.insertRow();

    row.insertCell(0).innerHTML = name;
    row.insertCell(1).innerHTML = reg;
    row.insertCell(2).innerHTML = total;
    row.insertCell(3).innerHTML = average;
    row.insertCell(4).innerHTML = grade;

    document.getElementById("name").value = "";
    document.getElementById("regno").value = "";
    document.getElementById("m1").value = "";
    document.getElementById("m2").value = "";
    document.getElementById("m3").value = "";
}