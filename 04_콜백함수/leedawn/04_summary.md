# 콜백 함수

## 콜백 함수란?

콜백 함수는 다른 코드의 인자로 넘겨주는 함수이다. 콜백 함수를 넘겨받은 코드는 이 콜백 함수를 필요에 따라 적절한 시점에 실행할 것이다.

콜백 함수는 다른 코드(함수 또는 메서드)에게 인자로 넘겨줌으로써 그 **제어권**도 함께 위임한 함수이다. 콜백 함수를 위임받은 코드는 자체적인 내부 로직에 의해 이 콜백 함수를 적절한 시점에 실행할 것이다.

## 제어권

### 4-2-1 | 호출 시점

```javascript
var count = 0;
var cbFunc = function () {
  console.log(count);
  if (++count > 4) clearInterval(timer);
};
var timer = setInterval(cbFunc, 300);
/* 실행 결과(0.3초마다)
 * 0
 * 1
 * 2
 * 3
 * 4
 */
```

timer 변수에는 setInterval의 ID값이 담긴다.

> setInterval을 실행하면 반복적으로 실행되는 내용 자체를 특정할 수 있는 고유한 ID값이 반환된다. 이를 변수에 담는 이유는 반복 실행되는 중간에 종료(clearInterval)할 수 있게 하기 위해서임.

setInterval이라고 하는 '다른 코드'에 첫번째 인자로서 cbFunc 함수를 넘겨주자 제어권을 넘겨받은 setInterval이 스스로의 판단에 따라 적절한 시점에(0.3초마다) 이 익명함수를 실행했다. **이처럼 콜백 함수의 제어권을 넘겨받은 코드는 콜백 함수 호출 시점에 대한 제어권을 가진다.**

### 4-2-2 | 인자

```javascript
var newArr = [10, 20, 30].map(function (currentValue, index) {
  console.log(currentValue, index);
  return currentValue + 5;
});
console.log(newArr);
/* 실행 결과
 * 10 0
 * 20 1
 * 30 2
 * [15, 25, 35]
 */
```

```javascript
Array.prototype.map(callback[, thisArg])
callback: function(currentValue, index, array)
```

map 메서드는 첫번째 인자로 callback 함수를 받고, 생략 가능한 두번째 인자로 콜백 함수 내부에서 this로 인식할 대상을 특정할 수 있다. thisArg를 생략할 경우네는 일반적인 함수와 마찬가지로 전역객체가 바인딩된다.

항상 MDN에서 메서드를 찾아볼 때, thisArg는 뭐야하고 넘어갔었는데 이런 의미였고만,,

제이쿼리(jQuery)의 메서드들은 기본적으로 첫번째 인자에 index가, 두번째 인자에 currentValue가 온다.

### 4-2-3 | this

3장에서 콜백 함수도 함수이기 때문에 기본적으로는 this가 전역객체를 참조하지만, 제어권을 넘겨받을 코드에서 콜백 함수에 별도로 this가 될 대상을 지정한 경우에는 그 대상을 참조하게 된다고 나와있다. 별도의 this를 지정하는 방식 및 제어권에 대한 이해를 높이기 위해 map 메서드를 직접 구현해보자.

```javascript
Array.prototype.map = function (callback, thisArg) {
  var mappedArr = [];
  for (var i = 0; i < this.length; i++) {
    var mappedValue = callback.call(thisArg || window, this[i], i, this);
    mappedArr[i] = mappedValue;
  }
  return mappedArr;
};
```

this에는 thisArg값이 있을 경우에는 그 값을, 없을 경우에는 전역객체를 지정하고, 첫번째 인자에는 메서드의 this가 배열을 가리킬 것이므로 배열의 i번째 요소 값을, 두번째 인자에는 i값을, 세번째 인자에는 배열 자체를 지정해 호출한다. 그 결과가 변수 mappedValue에 담겨 mappedArr의 i번째 인자에 할당된다.

이제 this에 다른값이 담기는 이유를 정확히 알 수 있다! 바로 **제어권을 넘겨받을 코드에서 call/apply 메서드의 첫번째 인자에 콜백 함수 내부에서의 this가 될 대상을 명시적으로 바인딩하기 때문이다.**

```javascript
setTimeout(function () { console.log(this); }, 300) // (1) Window { ... }

[1, 2, 3, 4, 5].forEach(function (x) {
  console.log(this)
}); // (2) Window { ... }

document.body.innerHTML += '<button id="a">클릭</button>;
document.body.querySelector('#a').addEventListener('click', function (e) {
  console.log(this, e); // (3) <button id="a">클릭</button>
                        // MouseEvent { isTrusted: true, ... }
});
```

각각 콜백 함수 내에서의 this를 살펴보자.

(1) : 전역 객체
(2) : 전역 객체
(3) : addEventListener는 내부에서 콜백 함수를 호출할 때 call 메서드의 첫번째 인자에 addEventListener 메서드의 this를 그대로 넘기도록 정의돼 있기 때문에 콜백 함수 내부에서의 this가 addEventListaner를 호출한 주체인 HTML 엘리먼트를 가리키게 된다.

## 콜백 함수는 함수다

콜백 함수로 어떤 객체의 메서드를 전달하더라도 그 메서드는 메서드가 아닌 함수로서 호출된다.

```javascript
var obj = {
  vals: [1, 2, 3],
  logValues: function (v, i) {
    console.log(this, v, i);
  },
};
obj.logValues(1, 2); // { vals: [1, 2, 3], logValues: f } 1 2
[4, 5, 6].forEach(obj.logValues); // Window { ... } 4 0
```

obj 객체의 logValues는 메서드로 정의됨. 따라서 this는 obj를 가리키고, 인자로 넘어온 1, 2가 출력된다.
한편 8번째 줄에서는 이 메서드를 forEach 함수의 콜백 함수로서 전달했다. **forEach에 의해 콜백이 함수로서 호출되고, 별도로 this를 지정하는 인자를 지정하지 않았으므로 함수 내부에서의 this는 전역 객체를 바라보게 된다.**

즉, 어떤 함수의 인자에 객체의 메서드를 전달하더라도 이는 결국 메서드가 아닌 함수일 뿐이다. 이 차이를 정확히 이해하는 것이 중요하다!

## 콜백 함수 내부의 this에 다른 값 바인딩하기

객체의 메서드를 콜백 함수로 전달하면 해당 객체를 this로 바라볼 수 없게 된다는 점을 다시 한번 새기고,,

그럼에도 콜백 함수 내부에서 this가 객체를 바라보게 하고 싶다면 어떻게 해야할까? 별도의 인자로 this를 받는 함수의 경우에는 여기에 원하는 값을 넘겨주면 되지만 그렇지 않은 경우에는 this의 제어권도 넘겨주게 되므로 사용자가 임의로 값을 바꿀 수 없다. 그래서 전통적으로는 this를 다른 변수에 담아 콜백 함수로 활용할 함수에서는 this 대신 그 변수를 사용하게 하고, 이를 클로저로 만드는 방식이 많이 쓰였다.

이제는 전통적인 방식의 아쉬움(코드의 복잡합, 메모리 낭비 등)을 ES5에서 등장한 bind 메서드를 이용하여 보완할 수 있다.

```javascript
var obj1 = {
  name: "obj1",
  func: function () {
    console.log(this.name);
  },
};
setTimeout(obj1.func.bind(obj1), 1000);

var obj2 = { name: "obj2" };
setTimeout(obj1.func.bind(obj2), 1500);
```

## 콜백 지옥과 비동기 제어

**콜백 지옥(callback hell)은 콜백 함수를 익명 함수로 전달하는 과정이 반복되어 코드의 들여쓰기 수준이 감당하기 힘들 정도로 깊어지는 현상**이다. 주로 이벤트 처리나 서버 통신과 같이 비동기적인 작업을 수행하기 위해 자주 등장하곤 한다.

- 동기(synchronous)적인 코드 : 현재 실행 중인 코드가 완료된 후에야 다음 코드를 실행하는 방식
- 비동기(asynchronous)적인 코드 : 현재 실행 중인 코드의 완료 여부와 무관하게 즉시 다음 코드로 넘어감.

콜백 지옥의 가독성 문제와 어색함을 동시에 해결하는 가장 간단한(?) 방법은 익명의 콜백 함수를 모두 기명함수로 전환하는 것이다. 그렇지만, 코드명을 일일이 따라다녀야 하므로 오히려 헷갈릴 소지가 있다. 지난 십수 년간 자바스크립트 진영은 비동기적인 일련의 작업을 동기적으로, 혹은 동기적인 것처럼 보이게끔 처리해주는 장치를 마련하고자 끊임없이 노력해왔다.

ES6에서는 Promise, Generator 등이 도입됐고, ES2017에서는 async/await가 도입됐다.

### Promise

new 연산자와 함께 호출한 Promise의 인자로 넘겨주는 콜백 함수는 호출할 때 바로 실행되지만 그 내부에 resolve 또는 reject 함수를 호출하는 구문이 있을 경우 둘 중 하나가 실행되기 전까지는 다음(then) 또는 오류 구문(catch)으로 넘어가지 않는다. **따라서 비동기 작업이 완료될 떄 비로소 resolve 또는 reject를 호출하는 방법으로 비동기 작업의 동기적 표현이 가능하다.**

### Generator

Generator는 함수의 실행을 중간에 멈췄다가 재개할 수 있는 기능이다. Promise와 마찬가지로 비동기 작업을 동기적으로 보이게 할 수 있다.

```javascript
var addCoffee = function (prevName, name) {
  setTimeout(function () {
    coffeeMaker.next(prevName ? prevName + ", " + name : name);
  }, 500);
};
var coffeeGenerator = function* () {
  var espresso = yield addCoffee("", "에스프레소");
  console.log(espresso);
  var americano = yield addCoffee(espresso, "아메리카노");
  console.log(americano);
  var mocha = yield addCoffee(americano, "카페모카");
  console.log(mocha);
  var latte = yield addCoffee(mocha, "카페라뗴");
  console.log(latte);
};
var coffeeMaker = coffeeGenerator();
coffeeMaker.next();
```

6번째 줄의 '\*'이 붙은 함수가 바로 Generator 함수이다. Generator 함수를 실행하면 Iterator가 반환되는데, Iterator은 next라는 메서드를 가진다. 이 next 메서드를 호출하면 Generator 함수 내부에서 가장 먼저 등장하는 yield에서 함수의 실행이 멈춘다. 이후 다시 next 메서드를 호출하면 앞서 멈췄던 부분부터 시작해서 그 다음에 등장하는 yield에서 함수의 실행이 멈춘다. 그러니까 비동기 작업이 완료되는 시점마다 next 메서드를 호출해준다면 Generator 함수 내부의 소스가 위에서부터 아래로 순차적으로 진행되겠쥬?

### async/await

ES2017에서 등장했으며, Promise를 좀 더 편하게 쓸 수 있다. 비동기 작업을 수행하고자 하는 함수 앞에 async를 표기하고, 함수 내부에서 실질적인 비동기 작업이 필요한 위치마다 await를 표기하는 것만으로 뒤의 내용을 Promise로 자동 전환하고, 해당 내용이 resolve된 이후에야 다음으로 진행한다. 즉, Promise의 then과 흡사한 효과를 얻을 수 있다.
