var fruits = ['apple', 'banana', 'peach'];
var $ul = document.createElement('ul');     // 공통 코드

var alertFruitBuilder = function (fruits) {
    return function () {
        alert('your choice is ' + fruits);
    };
};
fruits.forEach(function (fruits) {
    var $ul = document.createElement('li')
    $li.innerText = fruits;
    $li.addEventListener('click', alertFruitBuilder(fruits));
    $ul.appendChild($li);
});