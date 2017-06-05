var budgetController = (function() {
    var data, Expense, Income, calculateTotal;
    
    data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };    
    
    Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    
    Expense.prototype.calcPercentage = function(totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value/totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };
    
    Expense.prototype.getPercentage = function() {
        return this.percentage;
    }
    
    Income = function (id, description, value) {
        this.id = id; 
        this.description = description;
        this.value = value;
    };
    
    calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function (cur) {
            sum += cur.value;
        });
        data.totals[type] = sum;
    };
    
    return {
        addItem: function(type, des, val) {
            var newItem, ID;
            
            if(data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length-1].id + 1;
            } else {
                ID = 0;
            }
            
            if (type === "inc") {
                newItem = new Income(ID, des, val);
            } else if (type ==="exp") {
                newItem = new Expense(ID, des, val);  
            }
            
            data.allItems[type].push(newItem);
            return newItem;
        },
        
        deleteItem: function(type, id) {
            var ids, index;
            
            ids = data.allItems[type].map(function(cur){
                return cur.id;
            });
            index = ids.indexOf(id);
            
            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },
        
        calculateBudget: function() {
            calculateTotal('inc');
            calculateTotal('exp');
            
            data.budget = data.totals.inc - data.totals.exp;
            
            if(data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp/data.totals.inc)*100);
            } else {
                data.percentage = -1;
            }
        }, 
        
        calculatePecentages: function() {
            data.allItems.exp.forEach(function(cur) {
                cur.calcPercentage(data.totals.inc);
            });
        },
        
        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },
        
        getPercentages: function() {
            var allPercentages = data.allItems.exp.map(function(cur) {
                return cur.getPercentage()
            });
            return allPercentages;
        },
        
        testing: function() {
            console.log(data);
        }
    };
}) ();


var UIController = (function() {
    var formatNumber =  function(num) {
        var numSplit, int, dec; 
        
        num = num.toFixed(2);
        numSplit = num.split('.');
        int = numSplit[0];
        dec = numSplit[1];
        
        if (int.length >3) {
            int = int.substr(0,int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }
        
        return int + '.' + dec;
    };    
    
    return {
        getInput: function() {
            return {
                type: document.querySelector('.add__type').value,
                description: document.querySelector('.add__description').value,
                value: parseFloat(document.querySelector('.add__value').value)
            };
        },
        
        addListItem: function(obj, type) {
            var html, newHtml, element; 
            if (type === "inc") {
                element = ".income__list"
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">+ %value%</div><div class="item__delete"><button class="item__delete--btn"><i class="fa fa-times-circle-o"></i></button></div></div></div>'
            } else if (type === "exp") {
                element = ".expenses__list"
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">- %value%</div><div class="item__percentage">%percentages%</div><div class="item__delete"><button class="item__delete--btn"><i class="fa fa-times-circle-o"></i></button></div></div></div>'
            };
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value));
            
            document.querySelector(element).insertAdjacentHTML("beforeend", newHtml);
        },
        
        deleteListItem: function(id) {
            var element = document.getElementById(id);
            element.parentNode.removeChild(element);
        },
        
        clearFields: function() {
            var fields, fieldsArray;
            fields = document.querySelectorAll('.add__description' + ', ' + '.add__value');
            fieldsArray = Array.prototype.slice.call(fields);
            fieldsArray.forEach(function(cur, i, array) {
                cur.value = "";
            });
            fieldsArray[0].focus();
        },
        
        displayBudget: function(obj) {
            document.querySelector('.budget__value').textContent = formatNumber(obj.budget);
            document.querySelector('.budget__income--value').textContent = "+ " + formatNumber(obj.totalInc);
            document.querySelector('.budget__expenses--value').textContent = "- " + formatNumber(obj.totalExp);
            if (obj.percentage > 0) {
                document.querySelector('.budget__expenses--percentage').textContent = obj.percentage + "%";
            } else {
                document.querySelector('.budget__expenses--percentage').textContent = "---";
            }
        },
        
        displayPercentages: function(perc) {
            var fields = document.querySelectorAll('.item__percentage'); 
            var nodeListForEach = function(list, callback) {
                for (var i = 0; i < list.length; i++) {
                    callback(list[i], i);
                }
            };
           
            nodeListForEach(fields, function(current, index) {
                if (perc[index] > 0) {
                    current.textContent = perc[index] + '%';
                } else {
                    current.textContent = '---';
                }
            });
        },
        
        displayMonth: function() {
            var now, month, year, months;
            
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            
            now = new Date(); 
            month = now.getMonth();
            month = months[month];
            year = now.getFullYear();
            document.querySelector('.budget__title--month').textContent = month + ' ' + year;
        }
    };
}) ();


var controller = (function(budgetCtrl, UICtrl) {
    var setupEventListener = function() {
        document.querySelector('.add__btn').addEventListener('click', ctrlAddItem);
    
        document.addEventListener('keypress', function(event) {
            if (event.keyCode === 13 || event.which === 13){
                ctrlAddItem();
            }
        });        
        
        document.querySelector('.container').addEventListener('click', ctrlDeleteItem);
    };
    
    var updateBudget = function() {
        // Calculate the budget
        budgetCtrl.calculateBudget();
        // Return budget
        var budget = budgetController.getBudget();
        // Display budget on UI
        UICtrl.displayBudget(budget);
    };
    
    var updatePercentages = function() {
        // Calculate percentages
        budgetCtrl.calculatePecentages();
        // Read percentages from budget controller
        var percentages = budgetCtrl.getPercentages();
        // Display percentage on UI
        UICtrl.displayPercentages(percentages);
    }
    
    var ctrlAddItem = function() {
        var input, newItem;
        // Get field input data
        input = UICtrl.getInput();
        
        if(input.description !== "" && !isNaN(input.value) && input.value > 0) {
            // Add item to budget calculator
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);
            // Add item to UI
            UICtrl.addListItem(newItem, input.type);
            // Clear fields
            UICtrl.clearFields();
            // Calculate and update budget
            updateBudget();
            // Calculate and update percentages
            updatePercentages();
        }
    };
    
    var ctrlDeleteItem = function(event) {
        var itemID, splitID, type, ID;
        
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        console.log(itemID);
        if(itemID) {
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);
            
            budgetCtrl.deleteItem(type, ID);
            
            UICtrl.deleteListItem(itemID);
            
            updateBudget();
            // Calculate and update percentages
            updatePercentages();
        }
    };
    
    
    return {
        init: function() {
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp:0,
                percentage: -1
            });
            setupEventListener();
        }
    };
    
    
}) (budgetController, UIController);

controller.init();
