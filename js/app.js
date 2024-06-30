const form = document.getElementById("transactionForm");
form.addEventListener("submit", function(event) {
    event.preventDefault();
    let transactionFormData = new FormData(form);
    const fecha = document.getElementById("fecha").value.trim();
    const monthYear = document.getElementById("monthyear").value.trim();
    const comment = document.getElementById("comment").value.trim();
    const ticket = document.getElementById("ticket").value.trim();
    const transaction = document.querySelector(`input[name="stransaction"]:checked`);
    const result = document.getElementById("result").value.trim();
    const equity = document.getElementById("equity").value.trim();
    if (fecha === "" || monthYear === "" || comment === "" || ticket === "" || !transaction || result === "" || equity === "") {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Por favor, complete todos los campos."
        });
      return;
    }
    if (!/^\d+$/.test(fecha)) {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Por favor, ingrese una fecha válida."
        });
      return;
    }
    if (!/^\d{5}$/.test(monthYear)) {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Por favor, ingrese un Mes-Año válido (Ej: 62024)."
        });
      return;
    }/*
    if (!/^\d+$/.test(equity)) {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Por favor, ingrese solo números para 'Equity'."
        });
        return;
    }*/
    let transactionObj = convertFormDataToTransactionObject(transactionFormData);
    saveTransactionObj(transactionObj);
    insertRowInTransactionTable(transactionObj);
    form.reset();
});
document.addEventListener("DOMContentLoaded", function(event){
    actualizarH2DesdeLocalStorage();
    let transactionObjArry = JSON.parse(localStorage.getItem("transactionData"));
    if (transactionObjArry) {
        transactionObjArry.forEach(
            function(transactionElement){
                insertRowInTransactionTable(transactionElement);
            }
        );
    }
});
function getNewTransactionId(){
    let lastTransactionId = localStorage.getItem("lastTransactionId") || "-1";
    let newtransactionId = JSON.parse(lastTransactionId) + 1;
    localStorage.setItem("lastTransactionId" , JSON.stringify(newtransactionId));
    return newtransactionId;
}
function convertFormDataToTransactionObject(transactionFormData) {
    let comment = transactionFormData.get("comment");
    let date = transactionFormData.get("date");
    let monthyear = transactionFormData.get("monthyear");
    let ticket = transactionFormData.get("ticket");
    let stransaction = transactionFormData.get("stransaction");
    let result = transactionFormData.get("result");
    let equity = transactionFormData.get("equity");  
    let transactionId = getNewTransactionId();
    return {
        "comment":comment,
        "date": date,
        "monthyear": monthyear,
        "ticket": ticket,
        "stransaction": stransaction,
        "result": result,
        "equity": equity,
        "transactionId": transactionId
    };
}
function insertRowInTransactionTable(transactionObj) {
    let transactionTableRef = document.getElementById("transactiontable");
    let newtransactionRow = transactionTableRef.insertRow(-1);
    newtransactionRow.setAttribute("data-transaction-id", transactionObj["transactionId"]);
    let newTypeCellRef = newtransactionRow.insertCell(0);
    newTypeCellRef.textContent = transactionObj.comment;
    newTypeCellRef = newtransactionRow.insertCell(1);
    newTypeCellRef.textContent = transactionObj.date;
    newTypeCellRef = newtransactionRow.insertCell(2);
    newTypeCellRef.textContent = transactionObj.monthyear;
    newTypeCellRef = newtransactionRow.insertCell(3);
    newTypeCellRef.textContent = transactionObj.ticket;
    newTypeCellRef = newtransactionRow.insertCell(4);
    newTypeCellRef.textContent = transactionObj.stransaction;
    newTypeCellRef = newtransactionRow.insertCell(5);
    newTypeCellRef.textContent = transactionObj.result;
    newTypeCellRef = newtransactionRow.insertCell(6);
    newTypeCellRef.textContent = transactionObj.equity;

    actualizarH2DesdeLocalStorage();

    let newDeleteCell = newtransactionRow.insertCell(7);
    let deleteButton = document.createElement("button");
    deleteButton.textContent = "Delete";
    newDeleteCell.appendChild(deleteButton);
    deleteButton.addEventListener("click", (event) => {
        let transactionRow = event.target.parentNode.parentNode;
        let transactionId = transactionRow.getAttribute("data-transaction-id");
        const swalWithBootstrapButtons = Swal.mixin({
            customClass: {
                confirmButton: "btn btn-success",
                cancelButton: "btn btn-danger"
            },
            buttonsStyling: false
        });
        swalWithBootstrapButtons.fire({
            title: "¿Estás seguro?",
            text: "¡No podrás revertir estos cambios!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "¡Si, bórralo!",
            cancelButtonText: "¡No, cancela!",
            reverseButtons: true
        }).then((result) => {
            if (result.isConfirmed) {
                transactionRow.remove();
                deleteTransactionObj(transactionId);
                actualizarH2DesdeLocalStorage();
                swalWithBootstrapButtons.fire({
                    title: "¡Borrado!",
                    text: "La fila ha sido eliminada",
                    icon: "success"
                });
            } else if (result.dismiss === Swal.DismissReason.cancel) {
                swalWithBootstrapButtons.fire({
                    title: "Anulado",
                    text: "Tu fila está a salvo :)",
                    icon: "error"
                });
            }
        });
    }); 
}
function actualizarH2DesdeLocalStorage() {
    let transactionObjArry = JSON.parse(localStorage.getItem("transactionData")) || [];
    let valorPositivoEquity = transactionObjArry.reduce((total, transaction) => {
        return total + (parseFloat(transaction.result) > 0 ? (parseFloat(transaction.result) / 100) * parseFloat(transaction.equity) : 0);
    }, 0);
    let valorNegativoEquity = transactionObjArry.reduce((total, transaction) => {
        return total + (parseFloat(transaction.result) < 0 ? (parseFloat(transaction.result) / 100) * parseFloat(transaction.equity) : 0);
    }, 0);
    let diferenciaEquity = valorPositivoEquity - Math.abs(valorNegativoEquity);
    let h2Positivo = document.getElementById('h2Positivo');
    let h2Negativo = document.getElementById('h2Negativo');
    let h2DiferenciaEquity = document.getElementById('h2DiferenciaEquity');
    h2Positivo.textContent = `$ ${valorPositivoEquity.toFixed(2)}`;
    h2Negativo.textContent = `$ ${valorNegativoEquity.toFixed(2)}`;
    h2DiferenciaEquity.textContent = `$ ${diferenciaEquity.toFixed(2)}`;
    let totalEquity = valorPositivoEquity + Math.abs(valorNegativoEquity);
    let porcentajePositivo = (valorPositivoEquity / totalEquity) * 100;
    let porcentajeNegativo = (Math.abs(valorNegativoEquity) / totalEquity) * 100; 
    let Ganancia = document.getElementById('ganancia');
    let Perdida = document.getElementById('perdida');
    Ganancia.textContent = `Profit: ${porcentajePositivo.toFixed(2)}%`;
    Perdida.textContent = `Deficit: ${porcentajeNegativo.toFixed(2)}%`;
    let porcentajePositivoResult = transactionObjArry.reduce((total, transaction) => {
        return total + (parseFloat(transaction.result) > 0 ? parseFloat(transaction.result) : 0);
    }, 0);
    let porcentajeNegativoResult = transactionObjArry.reduce((total, transaction) => {
        return total + (parseFloat(transaction.result) < 0 ? parseFloat(transaction.result) : 0);
    }, 0);
    let PorcentajePositivoResult = document.getElementById('PorcentajePositivoResult');
    let PorcentajeNegativoResult = document.getElementById('PorcentajeNegativoResult');
    PorcentajePositivoResult.textContent = `Profit: ${porcentajePositivoResult.toFixed(2)}%`;
    PorcentajeNegativoResult.textContent = `Deficit: ${porcentajeNegativoResult.toFixed(2)}%`;
}
function deleteTransactionObj(transactionId){
    let transactionObjArry = JSON.parse(localStorage.getItem("transactionData"));
    let transactionIndexInArray = transactionObjArry.findIndex(element => element.transactionId === transactionId);
    transactionObjArry.splice(transactionIndexInArray, 1);
    let transactionArrayJSON = JSON.stringify(transactionObjArry);
        localStorage.setItem("transactionData", transactionArrayJSON);
}
function saveTransactionObj(transactionObj) {  
    let myTransactionArray = JSON.parse(localStorage.getItem("transactionData")) || [];
    myTransactionArray.push(transactionObj);
    let transactionArrayJSON = JSON.stringify(myTransactionArray);
    localStorage.setItem("transactionData", transactionArrayJSON);
}
async function getCryptoPrice(coinBase, coinTarget) {
    const url = `https://v6.exchangerate-api.com/v6/b911b8a39edee8190af04577/latest/${coinBase}`;
    const priceDisplay = document.getElementById("price-display");
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Error ${response.status}`);
        }
        const data = await response.json();
        if (data.result === "error") {
            throw new Error(data['error-type']);
        }
        const exchangeRate = data.conversion_rates[coinTarget.toUpperCase()];
        if (!exchangeRate) {
            throw new Error(`No se encontró la tasa de cambio para ${coinBase} a ${coinTarget}`);
        }
        const convertedPrice = exchangeRate.toFixed(6);
        priceDisplay.textContent = `1 ${coinBase} equivale a ${convertedPrice} ${coinTarget}`;
    } catch (err) {
        priceDisplay.textContent = `Error al obtener precio: ${err.message}`;
    }
}
document.getElementById('check-price-button').addEventListener('click', () => {
    const coinBase = document.getElementById('coin-input1').value.trim().toUpperCase();
    const coinTarget = document.getElementById('coin-input2').value.trim().toUpperCase();
    if (coinBase && coinTarget) {
        getCryptoPrice(coinBase, coinTarget);
    } else {
        document.getElementById("price-display").textContent = 'Por favor ingrese dos monedas válidas';
    }
});
