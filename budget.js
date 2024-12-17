var BudgetController= (function(){
    var Expense=function(id,description,value){
        this.id=id;
        this.description=description;
        this.value=value;
        this.percentage=-1;
    };
    Expense.prototype.calcPercentage=function(totalIncome){
        if(totalIncome>0){
            this.percentage=Math.round((this.value/totalIncome)*100);
        }else{
            this.percentage=-1;
        }
    };
    Expense.prototype.getPercentage=function(){
        return this.percentage;
    };
    var Income= function(id,description,value){
        this.id=id;
        this.description=description;
        this.value=value;
    };
    var calculateTotals=function(type){
        var sum;
        sum=0;
        data.allItems[type].forEach((cur)=>{
            sum+=cur.value;
        });
        data.totals[type]=sum;
    };

    var data={
        allItems:{
            exp:[],
            inc:[]
        },
        totals:{
            exp:0,
            inc:0
        },
        budget:0,
        percentage:-1
    }
    return{
        addItem:function(sign,desc,value){
            var newItem, ID;
            if(data.allItems[sign].length > 0){
                ID= data.allItems[sign][data.allItems[sign].length-1].id+1;
            }else{
                ID=0;
            }
            if(sign === 'inc'){
                newItem = new Income(ID,desc, value);
            }
            if(sign === 'exp'){
                newItem = new Expense(ID,desc, value);
            }
            data.allItems[sign].push(newItem);
            return newItem;
        },
        deleteItem:function(type,id){
            var ids,index;
            ids=data.allItems[type].map(function(current){
                return current.id;
            });
            index=ids.indexOf(id);
            if(index !== -1){
                data.allItems[type].splice(index,1);
            }
        },
        calculateBudget:function(){
           calculateTotals('exp') ;
           calculateTotals('inc') ;
            data.budget=data.totals.inc -data.totals.exp;
            if(data.totals.inc>0){
                data.percentage=Math.round((data.totals.exp/data.totals.inc)*100);
            }else{
                data.percentage=-1;
            }

        },
        calculatePercentages:function(){
            data.allItems.exp.forEach(function(cur){
                cur.calcPercentage(data.totals.inc);
            });
        },
        getPercentages:function(){
            var allPerc=data.allItems.exp.map(function(cur){
                return cur.getPercentage();
            });
            return allPerc;
        },
        getBudget:function(){
            return{
                budget:data.budget,
                totalInc:data.totals.inc,
                totalExp:data.totals.exp,
                percentage:data.percentage
            }
        },
        testing:function(){
            console.log('Your database');
            console.log(data.allItems);
        }

    }
    
})();
var UIController= (function(){
    var DOMstrings ={
        inputType:'.input__section-selector',
        inputDescription:'.input__section-description',
        inputValue:'.input__section-value',
        inputButton:'.button',
        incomeContainer:'.appendChild-income',
        expenseContainer:'.appendChild-expense',
        budgetLabel:'.budget__header-heading',
        incomeLabel:'.budget__header__income-number',
        expenseLabel:'.budget__header__expense-number',
        percentageLabel:'.budget__header__expense-percentage',
        container:'.expenditure__details',
        expensesPercLabel:'.expenditure__card__expense-price-percentage',
        dateLabel:'.budget__header-date'
    };
    var formatNumber=function(num,type){
        var numSplit, int,des,type;
        num= Math.abs(num);
        num=num.toFixed(2);
        numSplit=num.split('.');
        int=numSplit[0];
        if(int.length>3){
            int=int.substr(0,int.length-3)+','+int.substr(int.length-3,3);
        }
        des=numSplit[1];
        return (type ==='exp'?'-':'+') +' '+int+'.'+des;
    };
    var nodeListForEach=function(list, callback){
        for(var i=0;i<list.length;i++){
            callback(list[i],i);
        }

    };
    return{
        getInput:function(){
            return{
                type:document.querySelector(DOMstrings.inputType).value,
                description:document.querySelector(DOMstrings.inputDescription).value,
                value:parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },
        addListItem:function(obj, type){
            var html, newHtml,element;
             if(type ==='inc'){
                element=DOMstrings.incomeContainer;
                html='<div class="expenditure__card__income" id="inc-%id%"><p class="expenditure__card__income-description">%description%</p><div class="expenditure__card__income-flex"><div class="expenditure__card__income-price">%value%</div><div class="expenditure__card__income-price-delete" id="delete">X</div></div></div>';
            }else if(type ==='exp'){
                element=DOMstrings.expenseContainer;
                html='<div class="expenditure__card__expense" id="exp-%id%"><p class="expenditure__card__expense-description">%description%</p><div class="expenditure__card__expense-flex"><div class="expenditure__card__expense-price">%value%</div><div class="expenditure__card__expense-price-percentage">- 25%</div><div class="expenditure__card__expense-price-delete" id="delete">X</div></div></div>';
             }
             newHtml=html.replace('%id%', obj.id);
             newHtml=newHtml.replace('%description%', obj.description);
             newHtml=newHtml.replace('%value%',formatNumber(obj.value,type));
             console.log(element);
             document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);
        },
        removeListItem:function(selectorId){
            var el;
            el=document.getElementById(selectorId);
            el.parentNode.removeChild(el);
            console.log('child removed');
            
        },
        clearFields:function(){
            var fields, fieldsArr;
           fields= document.querySelectorAll(DOMstrings.inputDescription+','+DOMstrings.inputValue);
            fieldsArr=Array.prototype.slice.call(fields);
            console.log(fieldsArr);
            fieldsArr.forEach((item, index,array)=>{
                item.value='';
            });
            fields[0].focus();
            console.log(fields[0]);
        },
        displayBudget:function(obj){
            var type;
            obj.budget>0?type='inc':type='exp';
            document.querySelector(DOMstrings.budgetLabel).textContent=formatNumber(obj.budget,type);
            document.querySelector(DOMstrings.incomeLabel).textContent=formatNumber(obj.totalInc,'inc');
            document.querySelector(DOMstrings.expenseLabel).textContent=formatNumber(obj.totalExp,'exp');
            if(obj.percentage>0){
                document.querySelector(DOMstrings.percentageLabel).textContent=obj.percentage+'%';
            }else{
                document.querySelector(DOMstrings.percentageLabel).textContent='---';

            }

        },
        displayPercentages:function(percentages){
            var fields= document.querySelectorAll(DOMstrings.expensesPercLabel);
            nodeListForEach(fields, function(current,index){
                if(percentages[index]>0){
                    current.textContent=percentages[index]+'%';
                }else{
                    current.textContent='---';

                }
            });
        },
        displayMonth:function(){
            var now,year,month,months;
            now=new Date();
            months=['January','February','March','April','May','June','July','August','September','October','November','December'];
            month=now.getMonth();
            year=now.getFullYear();
            document.querySelector(DOMstrings.dateLabel).textContent= months[month]+' '+year;
        },
        changedType:function(){
            var fields = document.querySelectorAll(DOMstrings.inputType+","+DOMstrings.inputDescription+","+DOMstrings.inputValue);
            nodeListForEach(fields,function(cur){
                cur.classList.toggle('red-focus');
            });
            document.querySelector(DOMstrings.inputButton).classList.toggle('red');
        },
        getDomStrings:function(){
            return DOMstrings;
        }
    };
})();
var controller=(function(UICtrl,BudgetCtrl){
    var setupEventListeners=function(){
        document.querySelector(dom.inputButton).addEventListener('click',ctrlAddItem);
        document.addEventListener('keypress',function(e){
        if (e.keyCode===13||e.which===13){
            ctrlAddItem(e);
        }
        });
        document.querySelector(dom.container).addEventListener('click',ctrlDeleteItem);
        document.querySelector(dom.inputType).addEventListener('change',UICtrl.changedType)
    };
    var ctrlDeleteItem=function(e){
        var itemId,splitId,type,ID;
        if (e.target.id==='delete'){
            itemId=e.target.parentNode.parentNode.id;
            splitId=itemId.split('-');
            type=splitId[0];
            ID=parseInt(splitId[1]);
            //1.Delete item from the data structure
            BudgetCtrl.deleteItem(type,ID);
            //2.Delete item from the UI
            UICtrl.removeListItem(itemId);
            //3.Update and show the new budget
            updateBudget();
            // 4.Update percentages
            updatePercentages();
            
        }
    };
    var updateBudget=function(){
        BudgetCtrl.calculateBudget();
        var budget=BudgetCtrl.getBudget();
        UICtrl.displayBudget(budget);
        console.log(budget);
    };
    var updatePercentages=function(){
        // 1.Calculate percentages
        BudgetCtrl.calculatePercentages();
        // 2.Read percentages from the budget controller
        var percentages=BudgetCtrl.getPercentages();
        // 3.Update the UI with the new percentages
        UICtrl.displayPercentages(percentages);
    };
    var ctrlAddItem=function(e){
        e.preventDefault();
        var input,newItem;
        input=UICtrl.getInput();
        if(input.description !== "" && !isNaN(input.value) && input.value > 0){

            var newItem=BudgetCtrl.addItem(input.type,input.description,input.value);
            UICtrl.addListItem(newItem,input.type);
            UICtrl.clearFields();
            updateBudget();
            updatePercentages();
        }
    };
    var dom=UICtrl.getDomStrings();
    return {
        init:function(){
            console.log('Application has started');
            UICtrl.displayMonth();
            UICtrl.displayBudget(
                {
                    budget:0,
                    totalInc:0,
                    totalExp:0,
                    percentage:-1
                }
            );
            setupEventListeners();
        }
    };
})(UIController,BudgetController);
controller.init();
// console.log('Person 1: Show ticket');
// console.log('Person 2: Show ticket');

// var check= async function(){
//     let pro=new Promise((resolve,reject)=>{
//         setTimeout(()=>{
//             resolve('tick');
//         },3000);
//     });
//     let ticket= await pro;
//     await console.log(ticket);
//     await console.log('Person 4: Show ticket');
//  await console.log('Person 5: Show ticket');
// }
// check();


