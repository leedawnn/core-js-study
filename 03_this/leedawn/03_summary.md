# this

3장 목표 : 자바스크립트에서의 this는 어디서든 사용할 수 있다. 상황에 따라 this가 바라보는 대상이 달라지는데, 어떤 이유로 그렇게 되는지를 파악하기 힘든 경우도 있고 예상과 다르게 엉뚱한 대상을 바라보는 경우도 있다.

**함수와 객체(메서드)의 구분이 느슨한 자바스크립트에서 this는 실질적으로 이 둘을 구분하는 거의 유일한 기능이다.** 이번 장에서는 상황별로 this가 어떻게 달라지는지, 왜 그렇게 되는지, 예상과 다른 대상을 바라보고 있을 경우 그 원인을 효과적으로 추적하는 방법 등을 살펴보자.

## 상황에 따라 달라지는 this

자바스크립트에서 this는 기본적으로 실행 컨텍스트가 생성될 때 함께 결정된다. 실행 컨텍스트는 함수를 호출할 때 생성되므로, 바꿔 말하면 **this는 함수를 호출할 때 결정된다**고 할 수 있다.

### 3-1-1 | 전역 공간에서의 this

전역 공간에서 this는 전역 객체를 가리킨다. 전역 객체는 자바스크립트 런타임 환경에 따라 달라지며, 브라우저 환경에서는 `window`이고 Node.js 환경에서는 `global`이다.

**전역 공간에서만 발생하는 특이한 성질**

전역변수를 선언하면 자바스크립트 엔진은 이를 전역객체의 프로퍼티로도 할당한다.

```javascript
var a = 1;
console.log(a);
console.log(window.a);
console.log(this.a);
```

전역 공간에서 선언한 변수 a에 할당했을 뿐인데 window.a와 this.a 모두 1이 출력된다. 전역공간에서의 this는 전역객체를 의미하므로 두 값이 같은 값을 출력하는 것은 당연하지만, 그 값이 1인 것이 의아하다.

그 이유는 **자바스크립트의 모든 변수는 특정 객체의 프로퍼티로서 동작하기 때문**이다. 여기서 특정 객체란 실행 컨텍스트의 LexicalEnvironment이다. 실행 컨텍스트는 변수를 수집해서 L.E의 프로퍼티로 저장한다. 이후 어떤 변수를 호출하면 L.E를 조회해서 일치하는 프로퍼티가 있을 경우 그 값을 반환한다.

**전역 변수를 선언하면 자바스크립트 엔진은 이를 전역객체의 프로퍼티로 할당한다!**

전역 공간에서는 var로 변수를 선언하는 대신 window의 프로퍼티에 직접 할당하더라도 결과적으로 var로 선언한 것과 똑같이 동작할 것이라는 예상을 할 수 있을 것이다. 대부분의 경우에는 이 말이 맞지만 아닌 경우도 있다.

바로 '삭제' 명령에 대해 그렇다.

```javascript
var a = 1;
delete window.a; // false
console.log(a, window.a, this.a); // 1 1 1

var b = 2;
delete b; // false
console.log(b, window.b, this.b); // 2 2 2

window.c = 3;
delete window.c; // true
console.log(c, window.c, this.c); // Uncaught RefereneceError: C is not defined

window.d = 4;
delete d; // true
console.log(d, window.d, this.d); // Uncaught RefereneceError: D is not defined
```

위의 코드를 보면 처음부터 전역객체의 프로퍼티로 할당한 경우에는 삭제가 되는 반면 전역 변수로 선언한 경우에는 삭제가 되지 않는 것을 확인할 수 있다.

즉, 사용자가 의도치 않게 삭제하는 것을 방지하는 차원에서 전역변수를 선언하면 자바스크립트 엔진이 이를 자동으로 전역객체의 프로퍼티로 할당하면서 추가적으로 해당 프로퍼티의 configurable 속성(변경 및 삭제 가능성)을 false로 정의하는 것이다.

이처럼 var로 선언한 전역변수와 전역객체의 프로퍼티는 호이스팅 여부 및 configurable 여부에서 차이를 보인다.

### 3-1-2 | 메서드로서 호출할 때 그 메서드 내부에서의 this

#### 함수 vs 메서드

함수를 실행하는 방법에는 여러가지가 있다. 가장 일반적인 방법 두 가지는 함수로서 호출하는 경우와 메서드로서 호출하는 경우다.

이 둘을 구분하는 유일한 차이는 **독립성**에 있다. 함수는 그 자체로 독립적인 기능을 수행하는 반면, 메서드는 자신을 호출한 대상 객체에 관한 동작을 수행한다. 자바스크립트에서는 상황별로 this에 다른 값을 부여한다.

어떤 함수를 객체의 프로퍼티에 할당한다고 해서 그 자체로서 무조건 메서드가 되는 것이 아니라 객체의 메서드로서 호출할 경우에만 메서드로 동작하고, 그렇지 않으면 함수로 동작한다.

```javascript
var func = function (x) {
  console.log(this, x); // Window { ... }
};

func(1);

var obj = {
  method: func,
};

obj.method(2); // { method: f }
```

4번째 줄에서 func을 호출하면 this로 전역객체 Window가 출력된다. 6번째 줄에서 obj라는 변수에 객체를 할당하는데, 그 객체의 method 프로퍼티에 func 함수를 할당했다. 이제 9번째 줄에서 obj의 method를 호출하면 이번에는 this가 obj라고 한다.

즉, 원래의 익명함수는 그대로인데, 이를 변수에 담아 호출한 경우와 obj 객체의 프로퍼티에 할당해서 호출한 경우에 this가 달라지는 것이다.

그렇다면 '함수로서 호출'과 '메서드로서 호출'을 어떻게 구분할까?

함수 앞에 점(.)이 있는지 여부만으로 간단하게 구분할 수 있다. 4번째 줄은 앞에 점이 없으니 함수로서 호출한 것이고, 9번째 줄은 앞에 점이 있으니 메서드로서 호출한 것임.

`obj['method'](2)`처럼 대괄호 표기법도 같다. 점 표기법이든 대괄호 표기법이든, 어떤 함수를 호출할 때 그 함수 이름(프로퍼티명) 앞에 객체가 명시되어있는 경우에는 메서드로 호출한 것이고, 그렇지 않은 모든 경우에는 함수로 호출한 것!

#### 메서드 내부에서의 this

this에는 호출한 주체에 대한 정보가 담긴다. 어떤 함수를 메서드로서 호출한 경우 호출 주체는 바로 함수명(프로퍼티 명) 앞의 객체임.

### 3-1-3 | 함수로서 호출할 때 그 함수 내부에서의 this

#### 함수 내부에서의 this

어떤 함수를 함수로서 호출할 경우에는 this가 지정되지 않는다. 함수로서 호출하는 것은 호출 주체를 명시하지 않고 개발자가 코드에 직접 관여해서 실행한 것이기 때문에 호출 주체의 정보를 알 수 없는 것이다. 2장에서 배웠듯 실행 컨텍스트를 활성화할 당시에 this가 지정되지 않은 경우 this는 전역 객체를 바라본다고 했다. 따라서 함수에서의 this는 전역 객체를 가리킨다.

#### 메서드의 내부함수에서의 this

같은 함수임에도 바인딩되는 this가 달라질 수 있다. 즉, this 바인딩에 관해서는 함수를 실행하는 당시의 주변 환경(메서드 내부인지, 함수 내부인지 등)은 중요하지 않고, 오직 해당 함수를 호출하는 구문 앞에 점 또는 대괄호 표기가 있는지 없는지가 관건이다.

#### 메서드의 내부 함수에서의 this를 우회하는 방법

호출 주체가 없을 때는 자동으로 전역객체를 바인딩하지 않고 호출 당시 주변 환경의 this를 그대로 상속받아 사용할 수 있다면 좋을 것이다. 그게 훨씬 자연스러울뿐더러 자바스크립트 설계상 이렇게 동작하는 편이 스코프 체인과의 일관성을 지키는 설득력 있는 방식이다. 변수를 검색하면 우선 가장 가까운 스코프의 L.E에서 찾고 없으면 상위 스코프를 탐색하듯이, this 역시 현재 컨텍스트에 바인딩된 대상이 없으면 직전 컨텍스트의 this를 바라보도록 말이다.

아쉽게도 ES5까지는 자체적으로 내부함수에 this를 상속할 방법이 없지만 다행이 이를 우회할 방법이 아예 없지는 않다. 그중 대표적인 방법은 바로 변수를 활용하는 것이다.

```javascript
var obj = {
  outer: function () {
    console.log(this); // (1) { outer: f }
    var innerFunc1 = function () {
      console.log(this); // (2) Window { ... }
    };
    innerFunc1();

    var self = this;
    var innerFunc2 = function () {
      console.log(self); // (3) { outer: f }
    };
    innerFunc2();
  },
};
obj.outer();
```

위 예제의 innerFunc1 내부에서의 this는 전역객체를 가리킨다. outer 스코프에서 self라는 변수에 this를 저장한 상태에서 호출한 innerFunc2의 경우 self에는 객체 obj가 출력된다. 단순히 this를 변수에 담는 것이지만 기대에는 충실히 부합한다. 사람마다 다른 변수명을 쓰지만 self가 가장 많이 쓰이는 것 같다.

#### this를 바인딩하지 않는 함수

**ES6에서는 함수 내부에서 this가 전역객체를 바라보는 문제를 보완하고자, this를 바인딩하지 않는 화살표 함수를 새로 도입했다.** 화살표 함수는 실행 컨텍스트를 생성할 때 this 바인딩 과정 자체가 빠지게 되어, 상위 스코프의 this를 그대로 활용할 수 있다. (ES5 환경에서는 화살표 함수 사용 불가)

#### 콜백 함수 호출 시 그 함수 내부에서의 this

함수 A의 제어권을 다른 함수(또는 메서드) B에게 넘겨주는 경우 함수 A를 콜백 함수라고 한다. 콜백 함수도 함수이기 때문에 기본적으로 this가 전역 객체를 참조하지만, 제어권을 받은 함수에서 콜백 함수에 별도로 this가 될 대상을 지정할 경우에는 그 대상을 참조하게 된다.

```javascript
setTimeout(function () {
  console.log(this); // (1)
}, 300);

[1, 2, 3, 4, 5].forEach(function (x) {
  console.log(this, x); // (2)
});

document.body.innerHTML += '<button id="a">클릭</button>';
document.body.querySelector('#a').addEventListener('click', function (e) {
  console.log(this, e); // (3)
});
```

(1): 300ms 뒤 콜백함수가 실행되면서 전역객체가 출력된다.
(2): 배열의 각 요소를 차례로 꺼내어져 콜백 함수의 파라미터로 들어가면서 함수가 실행된다. 전역객체와 배열의 각 요소가 총 5회 출력된다.
(3): click 이벤트가 발생할 때마다 지정한 엘리먼트와 클릭 이벤트에 관한 정보가 담긴 객체가 출력된다.

addEventListener 메서드는 콜백함수를 호출할 때 자신의 this를 상속하도록 정의되어있다. 즉 메서드명의 점(.) 앞부분이 곧 this가 되는 것!

### 3-1-5 | 생성자 함수 내부에서의 this

생성자 함수는 어떤 공통된 성질을 지니는 객체들을 생성하는 데 사용하는 함수이다. 객체지향 언어에서는 생성자를 클래스, 클래스를 통해 만든 객체를 인스턴스라고 한다. 프로그래밍적으로 '생성자'는 구체적인 인스턴스를 만들기 위한 일종의 틀이다. 이 틀에는 해당 클래스의 공통 속성들이 미리 준비되어 있고, 여기에 구체적인 인스턴스의 개성을 더해 개별 인스턴스를 만들 수 있는 것!

**자바스크립트는 함수에 생성자로서의 역할을 함께 부여했다. new 명령어와 함께 함수를 호출하면 해당 함수가 생성자로서 동작하게 된다. 그리고 어떤 함수가 생성자 함수로서 호출된 경우 내부에서의 this는 곧 새로 만들 구체적인 인스턴스 자신이 된다.**

생성자 함수를 호출하면 우선 생성자의 prototype 프로퍼티를 참조하는 `__proto__`라는 프로퍼티가 있는 객체(인스턴스)를 만들고, 미리 준비된 공통 속성 및 개성을 해당 객체(this)에 부여한다. 이렇게 해서 구체적인 인스턴스가 만들어짐. **생성자 함수 내부에서의 this는 만들어진 각각의 인스턴스 객체를 가리킨다.**

## 명시적으로 this를 바인딩하는 방법

여태까지 상황별로 this에 어떤 값이 바인딩되는지를 살펴봤지만 이러한 규칙을 깨고 this에 별도의 대상을 바인딩하는 방법도 있다.

### 3-2-1 | call 메서드

```javascript
Function.prototype.call(thisArg[, arg1[, arg2[, ...]]])
```

call 메서드는 메서드의 호출 주체인 함수를 즉시 실행하도록 하는 명령이다. 이때 call 메서드의 첫 번째 인자를 this로 바인딩하고, 이후의 인자들을 호출할 함수의 매개변수로 한다. 함수를 그냥 실행하면 this는 전역객체를 참조하지만 call 메서드를 이용하면 임의의 객체를 this로 지정할 수 있다.

```javascript
var func = function (a, b, c) {
  console.log(this, a, b, c);
};

func(1, 2, 3); // Window { ... } 1 2 3
func.call({ x: 1 }, 4, 5, 6); // { x: 1 } 4 5 6
```

메서드에 대해서도 마찬가지다. 객체의 메서드를 그냥 호출하면 this는 객체를 참조하지만 call 메서드를 이용하면 임의의 객체를 this로 지정할 수 있다.

### 3-2-2 | apply 메서드

```javascript
Function.prototype.apply(thisArg[, argsArray])
```

apply 메서드는 call 메서드와 기능적으로 완전히 동일하다. apply 메서드는 두번째 인자를 배열로 받아 그 배열의 요소들을 호출할 함수의 매개변수로 지정한다는 점에서만 차이가 있다.

```javascript
var func = function (a, b, c) {
  console.log(this, a, b, c);
};
func.apply({ x: 1 }, [4, 5, 6]); // { x: 1 } 4 5 6

var obj = {
  a: 1,
  method: function (x, y) {
    console.log(this.a, x, y);
  },
};
obj.method.apply({ a: 4 }, [5, 6]); // 4 5 6
```

### 3-2-3 | call / apply 메서드의 활용

#### 유사배열객체에 배열 메서드를 적용

유사배열객체란 배열 같아 보이지만 사실 객체인 놈이다. 유사 배열 객체가 되는 조건은 다음과 같다.

1. 반드시 length 프로퍼티가 필요하다. 또한 프로퍼티의 값이 0 또는 양의 정수가 되어야한다.
2. 키가 0 또는 양의 정수인 프로퍼티가 존재해야한다(index 번호가 0번부터 시작해서 1씩 증가해야함).

유사배열객체와 일반 객체에 가장 큰 차이점은 배열의 메서드(forEact, map ...)를 사용할 수 없다는 것이다.

하지만, call / apply 메서드를 활용하면 유사배열객체에도 배열 메서드를 적용할 수 있다!

```javascript
var obj = {
  0: 'a',
  1: 'b',
  2: 'c',
  length: 3,
};

Array.prototype.push.call(obj, 'd'); // (1)
console.log(obj); // { 0: 'a', 1: 'b', 2: 'c', 3: 'd', length: 4 }

var arr = Array.prototype.slice.call(obj); // (2)
console.log(arr); // ['a', 'b', 'c', 'd']
```

(1)에서는 배열 메서드는 push를 객체 obj에 적용해 프로퍼티 3에 'd'를 추가했다. (2)에서는 slice 메서드를 적용해 객체를 배열로 전환했다. slice 메서드는 원래 시작 인덱스값과 마지막 인덱스값을 받아 시작값부터 마지막값의 앞부분까지의 배열 요소를 추출하는 메서드인데, 매개변수를 아무것도 넘기지 않을 경우에는 그냥 원본 배열의 얕은 복사본을 반환한다.

그 밖에도 유사배열객체에는 call / apply 메서드를 이용해 모든 배열 메서드를 적용할 수 있다. 배열처럼 인덱스와 length 프로퍼티를 지니는 문자열에서도 마찬가지이다. 단, 문자열의 경우 length 프로퍼티가 읽기 전용이기 때문에 원본 문자열에 변경을 가하는 메서드(push, pop 등)는 에러를 던지며, concat처럼 대상이 반드시 배열이어야하는 경우에는 에러는 나지 않지만 제대로 된 결과를 얻을 수 없다.

사실 call / apply를 이용해 형변환하는 것은 본래의 메서드의 의도와는 다소 동떨어진 활용법이라 할 수 있다. 이에 **ES6에서는 유사배열객체 또는 순회 가능한 모든 종류의 데이터 타입을 배열로 전환하는 `Array.from` 메서드를 새로 도입했다.**

```javascript
var obj = {
  0: 'a',
  1: 'b',
  2: 'c',
  length: 3,
};
var arr = Array.from(obj);
console.log(arr); // ['a', 'b', 'c']
```

#### 생성자 내부에서 다른 생성자를 호출

생성자 내부에 다른 생성자와 공통된 내용이 있을 경우 call 또는 apply를 이용해 다른 생성자를 호출하면 간단하게 반복을 줄일 수 있다.

```javascript
function Person(name, gender) {
  this.name = name;
  this.gender = gender;
}
function Student(name, gender, school) {
  Person.call(this, name, gender);
  this.school = school;
}
function Employee(name, gender, company) {
  Person.apply(this, [name, gender]);
  this.company = company;
}
var by = new Student('보영', 'female', '단국대');
var jn = new Employee('재난', 'male', '구골');
```

call / apply 메서드는 명시적으로 별도의 this를 바인딩하면서 함수 또는 메서드를 실행하는 훌륭한 방법이지만 오히려 이로 인해 this를 예측하기 어렵게 만들어 코드 해석을 방해한다는 단점이 있다. 그럼에도 불구하고 ES5 이하의 환경에서는 마땅한 대안이 없기 때문에 실무에서 매우 광범위하게 활용되고 있음.

### 3-2-4 | bind 메서드

```javascript
Function.prototype.bind(thisArg[, arg1[, arg2[, ...]]])
```

bind 메서드는 ES5에서 추가된 기능으로, call과 비슷하지만 즉시 호출하지는 않고 넘겨 받은 this 및 인수들을 바탕으로 새로운 함수를 반환하기만 하는 메서드이다.

### 3-2-5 | 화살표 함수의 예외사항

ES6에서 새롭게 도입된 화살표 함수는 실행 컨텍스트 생성 시 this를 바인딩하는 과정이 제외되었다. 즉 이 함수 내부에는 this가 아예 없으며, 접근하고자 하면 스코프체인상 가장 가까운 this에 접근하게 된다.

```javascript
var obj = {
  outer: function () {
    console.log(this);
    var innerFunc = () => {
      console.log(this);
    };
    innerFunc();
  },
};
obj.outer();
```

이렇게 하면 별도의 변수로 this를 우회하거나 call / apply / bind를 적용할 필요가 없어 더욱 간결하고 편리하다!!!!!

### 3-2-6 | 별도의 인자로 this를 받는 경우(콜백 함수 내에서의 this)

콜백함수를 인자로 받는 메서드 중 일부는 추가로 this로 지정할 객체(thisArg)를 인자로 지정할 수 있는 경우가 있다. 이러한 메서드의 thisArg 값을 지정하면 콜백 함수 내부에서 this 값을 원하는 대로 변경할 수 있다. 이러한 형태는 배열 메서드에 많이 포진되어 있으며, 같은 이유로 ES6에서 새로 등장한 Set, Map 등의 메서드에서도 일부 존재한다. 그 중 대표적인 배열 메서드인 forEach의 예를 살펴보자.

```javascript
var report = {
  sum: 0,
  count: 0,
  add: function () {
    var args = Array.prototype.slice.call(arguments);
    args.forEach(function (entry) {
      this.sum += entry;
      ++this.count;
    }, this);
  },
  average: function () {
    return this.sum / this.count;
  },
};
report.add(60, 85, 95);
console.log(report.sum, report.count, report.average()); // 240 3 80
```

배열의 forEach를 예로 들었지만, 이 밖에도 thisArg를 인자로 받는 메서드는 꽤 많이 있다.(map, filter, some 등)

## 정리

**다음 규칙은 명시적 this 바인딩이 없는 한 늘 성립한다.**

- 전역공간에서의 this는 전역객체(브라우저에서는 Window, Node.js에서는 global)를 참조한다.
- 어떤 함수를 메서드로서 호출한 경우 this는 메서드 호출 주체(메서드명 앞의 객체)를 참조한다.
- 어떤 함수를 함수로서 호출한 경우 this는 전역객체를 참조한다. 메서드의 내부함수에서도 같음.
- 콜백 함수 내부에서의 this는 해당 콜백 함수의 제어권을 넘겨받은 함수가 정의한 바에 따르며, 정의하지 않은 경우에는 전역객체를 참조한다.
- 생성자 함수에서의 this는 생성될 인스턴스를 참조한다.

**다음 규칙은 명시적 this 바인딩에 해당**된다. 위 규칙에 부합하지 않는 경우 다음 내용을 바탕으로 this를 예측할 수 있다.

- call, apply 메서드는 this를 명시적으로 지정하면서 함수 또는 메서드를 호출한다.
- bind 메서드는 this 및 함수에 넘길 인수를 일부 지정해서 새로운 함수를 만든다.
- 요소를 순회하면서 콜백 함수를 반복 호출하는 내용의 일부 메서드는 별도의 인자로 this를 받기도 한다.
