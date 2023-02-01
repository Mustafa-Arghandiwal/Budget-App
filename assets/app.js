// Starting with the --Module View Control-- pattern



// First Module
var budgetController = (function () {

    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var data = {
        allItems: {
            income: [],
            expenses: [],
        },
        totals: {
            income: 0,
            expenses: 0,

        },
        budget: 0,
        percentage: -1,
    };

    var calculateTotal = function (type) {
        var sum = 0
        data.allItems[type].forEach(function (el) {
            sum += el.value;
        });
        data.totals[type] = sum;
    };



    return {
        addItem: function (type, desc, val) {
            var id, newItem;

            if (data.allItems[type].length > 0) {
                id = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                id = 0
            }

            if (type === 'income') {
                newItem = new Income(id, desc, val);
            } else {
                newItem = new Expense(id, desc, val)
            };


            data.allItems[type].push(newItem);

            return newItem;

        },
        calculateBudget: function () {
            calculateTotal('income');
            calculateTotal('expenses');

            data.budget = data.totals.income - data.totals.expenses;

            if (data.totals.income > 0) {

                data.percentage = Math.round((data.totals.expenses / data.totals.income) * 100)
            } else {
                data.percentage = '---'
            }


        },
        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.totals.income,
                totalExp: data.totals.expenses,
                percentage: data.percentage,

            }
        },

        calculatePercentages: function () {
            var valuesArr = [];
            valuesArr = data.allItems.expenses.map(function (i) {
                return i.value;
            });
            var percentagesArr = [];
            if (data.totals.income > 0) {
                percentagesArr = valuesArr.map(function (i) {
                    return Math.round(i / data.totals.income * 100)
                });
            } else {
                percentagesArr = -1
            };


            return percentagesArr;
        },

        deleteItem: function (type, id) {
            var newFiltered = data.allItems[type].filter(function (el) {
                return el.id !== id;
            })
            data.allItems[type] = newFiltered;



        },
    }


})();





// Second Module
var UIcontroller = (function () {

    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        monthLabel: '.budget__title--month',
    }


    var formatNumber = function (num, type) {

        var num = Math.abs(num);
        num = num.toFixed(2);
        splitted = num.split('.');
        intPart = splitted[0];
        decPart = splitted[1];
        intPart = parseInt(intPart).toLocaleString();

        var sign;
        if (type === 'expenses') {
            sign = '-'
        } else {
            sign = '+'
        }

        return sign + ' ' + intPart + '.' + decPart;


    }
    return {
        getInput: function () {
            return {
                type: document.querySelector(DOMstrings.inputType).value,
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value),

            };
        },


        addListItem: function (obj, type) {

            var html = `
			<div class="item clearfix" id="${type}-${obj.id}">
				<div class="item__description">${obj.description}</div>
				<div class="right clearfix">
					<div class="item__value" data-value="${obj.value}">${formatNumber(obj.value, type)}</div>
					${type === 'expenses' ? '<div class="item__percentage">0%</div>' : ''}
					<div class="item__delete">
						<button class="item__delete--btn">
							<i class="ion-ios-close-outline" data-item="${type}-${obj.id}">
							</i>
						</button>
					</div>
				</div>
			</div>
			`;
            document.querySelector(`.${type}__list`).insertAdjacentHTML('beforeend', html);
        },

        removeItemList: function (selectorID) {
            var item = document.getElementById(selectorID)
            item.parentNode.removeChild(item);

        },

        clearFields: function () {
            var arr = [];
            arr.push(document.querySelector(DOMstrings.inputDescription));
            arr.push(document.querySelector(DOMstrings.inputValue));

            arr.forEach(function (el) {
                el.value = '';
            })
            arr[0].focus();


        },
        displayBudget: function (obj) {
            var type;
            if (obj.budget > 0) {
                type = 'income';
            } else {
                type = 'expenses';
            }
            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'income');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'expenses');

            if (obj.percentage > 0) {
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';

            } else {
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';

            }

        },

        addPercentages: function (percentages) {
            var theNodeList = document.querySelectorAll('.item__percentage'); //coz of queryselectorALL
            for (i in theNodeList) {
                if (percentages[i] > 0) {
                    theNodeList[i].textContent = percentages[i] + '%';

                } else {
                    theNodeList[i].textContent = '---'
                }
            }

        },

        displayDate: function () {
            var d = new Date();
            var year = d.getFullYear();
            var month = d.toLocaleString('default', { month: 'long' });
            document.querySelector(DOMstrings.monthLabel).textContent = month + ' ' + year;
        },

        changeType: function () {
            document.querySelector(DOMstrings.inputType).classList.toggle('red-focus');
            document.querySelector(DOMstrings.inputDescription).classList.toggle('red-focus');
            document.querySelector(DOMstrings.inputValue).classList.toggle('red-focus');
            document.querySelector(DOMstrings.inputBtn).classList.toggle('red')

        },

        getDOMstrings: function () {
            return DOMstrings;
        },

    }

})();




// Third Module
var controller = (function (budgetCtrl, UIctrl) {



    var updateBudget = function () {

        budgetCtrl.calculateBudget();
        var budget = budgetCtrl.getBudget();
        UIctrl.displayBudget(budget);


    };



    var ctrlAddItem = function () {
        var input = UIctrl.getInput();

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {

            var newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            UIctrl.addListItem(newItem, input.type);

            UIctrl.clearFields();

            updateBudget();

            percentagesArr = budgetCtrl.calculatePercentages();

            UIctrl.addPercentages(percentagesArr);

            console.log(percentagesArr)



        }
    };

    var ctrlDeleteItem = function (event) {
        var itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {
            splitID = itemID.split('-');
            type = splitID[0]
            // .substring(0, 3);
            ID = parseInt(splitID[1])

        }
        budgetCtrl.deleteItem(type, ID);

        UIctrl.removeItemList(itemID);

        updateBudget();

        percentagesArr = budgetCtrl.calculatePercentages();

        UIctrl.addPercentages(percentagesArr);



    }



    var setupEventListeners = function () {
        var DOM = UIcontroller.getDOMstrings();
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
        document.addEventListener('keypress', function (event) {
            if (event.keyCode === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UIctrl.changeType);

    }








    return {
        init: function () {
            console.log('app started...');
            UIctrl.displayDate();
            setupEventListeners();
            UIctrl.displayBudget(
                {
                    budget: 0,
                    totalInc: 0,
                    totalExp: 0,
                    percentage: 0,
                }
            );
        }
    }


})(budgetController, UIcontroller);


controller.init();



//slide show part
let slideIndex = 1;
showSlides(slideIndex);

// Next/previous controls
function plusSlides(n) {
    showSlides(slideIndex += n);
}

// Thumbnail image controls
// function currentSlide(n) {
//     showSlides(slideIndex = n);
// }

function showSlides(n) {
    let i;
    let slides = document.getElementsByClassName("mySlides");
    // let dots = document.getElementsByClassName("dot");
    if (n > slides.length) { slideIndex = 1 }
    if (n < 1) { slideIndex = slides.length }
    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }
    // for (i = 0; i < dots.length; i++) {
    //     dots[i].className = dots[i].className.replace(" active", "");
    // }
    slides[slideIndex - 1].style.display = "block";
    // dots[slideIndex - 1].className += " active";
}






