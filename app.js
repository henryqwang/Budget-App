// BUDGET CONTROLLER
var budgetController = (function(){
    
    var Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };
    
    Expense.prototype.calcPercentages = function(totalIncome){
        if(totalIncome > 0){
            this.percentage = Math.round((this.value / totalIncome) * 100);
        }else{
            this.percentage = -1;
        }
        
    };
    
    Expense.prototype.getPercentages = function(){
        return this.percentage
    };
    
    var Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };
    
    var calculateTotal = function(type){
        var sum = 0;
        data.allItems[type].forEach(function(cur){
           sum += cur.value; 
        });
        
        data.totals[type] = sum;
    };
    
    
    var data = {
        allItems:{
            exp:[],
            inc:[]
        },
        totals:{
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    }
    
    return{
        
        addItem: function(type, desc, val){
            
            var newItem, ID;
  
            //Create new ID
            if(data.allItems[type].length > 0){
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }else{
                ID = 0;
            }
            
            
            //Create new ite based on 'inc' or 'exp' type
            if(type === 'exp'){
                newItem = new Expense(ID, desc, val);
            }else if (type === 'inc'){
                newItem = new Income(ID, desc, val);
            }
            
            //Push it into corresponding list
            data.allItems[type].push(newItem);
            return newItem;
        },
        
        deleteItem: function(type, id){
            
            var ids, index;
            
            ids = data.allItems[type].map(function(current, index, array){ //map(), unlike foreach(), can reutrn a new array rather than simply mutating the old one
                
                return current.id; // Basically fills new array with each items respective id
                
            });
            
            index = ids.indexOf(id); // Get the actual location / index of a given id, since ids might be out of order
            
            if(index !== -1){
                data.allItems[type].splice(index, 1); //(starting index, number of elements to include)
            }
        },
        
        calculateBudget: function(){
            
            // Calculate total income and total expense
            calculateTotal('inc');
            calculateTotal('exp');
            
            // Calculate the budget (tot inc - tot exp)
            data.budget = data.totals.inc - data.totals.exp;
            if(data.totals.inc > 0){
                // Calculate percentage of income we spent
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            }else{
                data.percentage = -1;
            }
            
            
        },
        getBudget: function(){
            return {
                budget: data.budget,
                totalIncome: data.totals.inc,
                totalExpenses: data.totals.exp,
                precentage: data.percentage
            }
        },
        
        calculatePercentages: function(){
            data.allItems.exp.forEach(function(current){
                current.calcPercentages(data.totals.inc);
            });
        },
        
        getPercentages:function(){
            var allPercentages = data.allItems.exp.map(function(current){
                return current.getPercentages();
            });
            return allPercentages;
        },
        
        testing: function(){
            
            console.log(data);
        }
    }
    
})();

// UI CONTROLLER
var UIController = (function(){
    var DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    }
    
    var formatNumber = function(num, type){
            
        var numSplit, int, dec;
            
        num = Math.abs(num);
        num = num.toFixed(2);
            
        numSplit = num.split('.');
            
        int = numSplit[0];
        
        if(int.length > 3){
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);    
        }
            
        dec = numSplit[1];
        
        var sign = (type === 'exp' ? '-' : '+');
            
        return (sign + ' ' + int + '.' + dec);
            
    };
    
    var nodeListForEach = function(list, callback){
                
        for(var i = 0; i < list.length; i++){
            callback(list[i], i);    
        }
                
    };
    
    return {
        getInput:function(){
            return{
                type: document.querySelector(DOMstrings.inputType).value, //Will be either 'inc' or 'exp'
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            }

        },
        addListItem:function(obj, type){
            
            var html, newHtml, element;
            
            //Create HTML string with placeholder text
            
            if(type === 'inc'){
                
                element = DOMstrings.incomeContainer;
                
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }else if(type === 'exp'){
                
                element = DOMstrings.expenseContainer;
                
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            
            //Replace the placeholder with actual data

            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
            
            //Insert the HTML into DOM

            var tmp = document.querySelector(element);
            tmp.insertAdjacentHTML('beforeend', newHtml);
        },
        
        deleteListItem: function(selectorId){
            
            var element;
            
            element = document.getElementById(selectorId);
            element.parentNode.removeChild(element);
        },
        
        clearField:function(){
            var fields, fieldsArray;
            
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);  //Returns a list, needs to convert into array
            fieldsArray = Array.prototype.slice.call(fields); //Now 'fields' replaces 'this' keyword for Array.prototype.call()
            fieldsArray.forEach(function(current, indexNumber, array){
                
                current.value = ''; //Sets description and value to empty string
                
            });
            
            fieldsArray[0].focus();
        },
        
        displayBudget:function(obj){
            document.querySelector(DOMstrings.budgetLabel).textContent = obj.budget;
            document.querySelector(DOMstrings.incomeLabel).textContent = obj.totalInc;
            document.querySelector(DOMstrings.expensesLabel).textContent = obj.totalExp;
            document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage;
            
            if(obj.percentage > 0){
                document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
            }else{
                document.querySelector(DOMstrings.percentageLabel).textContent = '---';
            }
        },
        
        displayPercentages: function(percentages){
            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel); //returns a node list (which isn't an array, thus does not have the foreach() function)
            
            
            nodeListForEach(fields, function(current, index){
                
                if(percentages[index] > 0){
                    current.textContent = percentages[index] + '%';
                }else{
                    current.textContent = '---';
                }
                
            });
        },
        
        displayMonth: function(){
            var now, month, year;
            var allMonths = ['January', 'Febuary', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        
            now = new Date();
        
            year = now.getFullYear();
            month = now.getMonth();
            
            document.querySelector(DOMstrings.dateLabel).textContent = allMonths[month] + ' ' + year;
        
        },
        
        changeType: function(){
            var fields = document.querySelectorAll(
                DOMstrings.inputType + ', '+
                DOMstrings.inputDescription + ', '+
                DOMstrings.inputValue
            );
            
            nodeListForEach(fields, function(current){
                current.classList.toggle('red-focus');
            });
            
            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
            
        },
                
        getDOMstring:function(){
            return DOMstrings;
        }

    }   
})();

// GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl){
    
    var setupEeventListeners = function(){
        
        var DOM = UICtrl.getDOMstring();
        
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
    
        /* Add event listener to Enter Key:
        Since pressing Enter key doesn't happen on specific view, make it global to 'document' */
        document.addEventListener('keypress', function(event){
            if(event.keyCode === 13 || event.which === 13){
                ctrlAddItem();
            }
        });
        
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
        
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType);
    };
    
    var updateBudget = function(){
        
        // 1. Calculate budget
        budgetCtrl.calculateBudget();
        
        // 2. Return the budget
        var budget = budgetCtrl.getBudget();
        
        // 2.  Display budget on UI
        UICtrl.displayBudget(budget);

    };
    
    var updatePercentages = function(){
        
        // 1. Call budget controller to calculate percentages
        budgetCtrl.calculatePercentages();
        
        // 2. Read percentages from budget controller
        var percentages = budgetCtrl.getPercentages();
        
        // 3. Update UI with new percentage
        UICtrl.displayPercentages(percentages);
    };
    
    var ctrlAddItem = function(){
        
        var input, newItem;
                
        // 1. Get the field input data
        input = UIController.getInput();
        
        if(input.description !== "" && !isNaN(input.value) && input.value > 0){
            
            // 2. Add item to budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. Render user interface with newly added item
            UICtrl.addListItem(newItem, input.type);

            // 4. Clear the fields
            UICtrl.clearField();

            // 5. Update and show budget
            updateBudget();
            
            // 6. Update percentages
            updatePercentages();
        }
    };
    
    var ctrlDeleteItem = function(event){
    
        var itemID, splitID, type, id;
        
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if(itemID){ //coerce itemID to boolean
            splitID = itemID.split('-');
            type = splitID[0];
            id = parseInt(splitID[1]); // splitID[1] is a string!
            
            // 1. Delete item from data structure
            budgetCtrl.deleteItem(type, id);
            
            // 2. Delete item from UI
            UICtrl.deleteListItem(itemID);
            
            // 3. Update and show the new budget
            updateBudget();
            
            // 4. Update percentages
            updatePercentages();
            
        }
    };
    
    return {
        init: function(){
            console.log('Application has started');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEeventListeners();
            
        }
    }
    

})(budgetController, UIController);


controller.init();