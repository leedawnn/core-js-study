# 클로저

## 클로저의 의미 및 원리 이해

클로저(Closure)는 여러 함수형 프로그래밍 언어에서 등장하는 보편적인 특성이다. 다양한 서적에서 클로저를 한 문장으로 요약해서 설명하는 부분들을 모아보면 다음과 같다.

- 자신을 내포하는 함수의 텍스트에 접근할 수 있는 함수 - 더글라스 크로포드
- 함수가 특정 스코프에 접근할 수 있도록 의도적으로 그 스코프에서 정의하는 것 - 에단 브라운
- 함수를 선언할 때 만들어지는 유효범위가 사라진 후에도 호출할 수 있는 함수 - 존 레식
- 이미 생명 주기상 끝난 외부 함수의 변수를 참조하는 함수 - 송형주 고현준
- 자유변수가 있는 함수와 자유변수를 알 수 있는 환경의 결합 - 에릭 프리먼
- 로컬 변수를 참조하고 있는 함수 내의 함수 - 야마다 요시히로
- 자신이 생설될 때의 스코프에서 알 수 있었던 변수들 중 언젠가 자신이 실행될 때 사용할 변수들만을 기억하여 유지시키는 함수 - 유인동

매우 많은 책에서 대부분 위와 같은 정의와 함께 자세한 설명을 이어나가고는 있지만, 문장만 놓고 이해하기엔 쉽지 않은 것 같다. 이번 장에서는 클로저의 일반적인 정의로부터 그 의미를 파악하고, 다양한 사례를 통해 성질을 살펴본 후 마지막에 이해하기 쉬운 문장으로 바꿔보는 방식으로 진행된다.

MDN에서는 클로저에 대해 "A closure is the combination of a function and the lexical environment within which that function was declared."라고 소개한다. 직역해보면 "**클로저는 함수와 그 함수가 선언될 당시의 lexical environment의 상호관계에 따른 현상**"정도가 된다.

'선언될 당시의 lexical environment'는 실행 컨텍스트의 구성 요소 중 하나인 outerEnvironmentReference에 해당한다. 2장에서 LexicalEnvironment의 environmentRecord와 outerEnvironmnetReference에 의해 스코프가 결정되고, 스코프 체인이 가능해진다고 했쥬?

여기서 'combination'의 의미를 파악할 수 있다. 내부함수에서 외부 변수를 참조하지 않는 경우라면 combination이라고 할 수 없다. **내부함수에서 외부 변수를 참조하는 경우에 한해서만 combination**, 즉 '**선언될 당시의 LexicalEnvironment와의 상호관계**'가 의미가 있을 것이다.

지금까지 파악한 내용에 따르면 클로저란 "어떤 함수에서 선언한 변수를 참조하는 내부함수에서만 발생하는 현상"이라고 볼 수 있겠다. 실제 예제를 통해 좀 더 명확히 알아보자.

#### 외부 함수의 변수를 참조하는 내부 함수(1)

```javascript
var outer = function () {
  var a = 1;
  var inner = function () {
    console.log(++a); // 2
  };
  inner();
};
outer();
```

outer 함수의 실행 컨텍스트가 종료되면 LexicalEnvironment에 저장된 식별자들(a, inner)에 대한 참조를 지운다. 그러면 각 주소에 저장돼 있던 값들은 자신을 참조하는 변수가 하나도 없게 되므로 가비지 컬렉터의 수집 대상이 될 것임.

#### 외부 함수의 변수를 참조하는 내부 함수(2)

```javascript
var outer = function () {
  var a = 1;
  var inner = function () {
    return ++a;
  };
  return inner();
};
var outer2 = outer();
console.log(outer2); // 2
```

두 가지 예제 모두 outer 함수의 실행 컨텍스트가 종료되기 이전에 inner 함수의 실행 컨텍스트가 종료돼 있으며, 이후 별도로 inner 함수를 호출할 수 없다는 공통점이 있다. 그렇다면 outer의 실행 컨텍스트가 종료된 후에도 inner 함수를 호출할 수 있게 만들면 어떨까?

#### 외부 함수의 변수를 참조하는 내부 함수(3)

```javascript
var outer = function () {
  var a = 1;
  var inner = function () {
    return ++a;
  };
  return inner;
};
var outer2 = outer();
console.log(outer2()); // 2
console.log(outer2()); // 3
```

이번에는 6번째 줄에서 inner 함수의 실행 결과가 아닌 inner 함수 자체를 반환했다. 그러면 outer 함수의 실행 컨텍스트가 종료될 때(8번째 줄) outer2 변수는 outer의 실행 결과인 inner 함수를 참조할 것이다. 이후 9번째에서 outer2를 호출하면 앞서 반환된 함수인 inner가 실행된다.

스코프 체이닝에 따라 outer에서 선언한 변수 a에 접근해서 1만큼 증가시킨 후 그 값인 2를 반환하고, inner 함수의 실행 컨텍스트가 종료된다. 10번째 줄에서 다시 outer2를 호출하면 같은 방식으로 a의 값을 증가시켜 3을 반환한다.

여기서 inner 함수의 실행 시점에는 outer 함수가 이미 실행 종료된 상태인데 outer 함수의 LexicalEnvironment에 어떻게 접근할 수 있는걸까?

**이는 가비지 컬렉터의 동작 방식 때문이다. 가비지 컬렉터는 어떤 값을 참조하는 변수가 하나라도 있다면 그 값은 수집 대상에 포함시키지 않는다.**

즉, "어떤 함수에서 선언한 변수를 참조하는 내부함수에서만 발생하는 현상"이란 "외부 함수의 LexicalEnvironment가 가비지 컬렉팅되지 않는 현상"을 말하는 것이다.

이를 바탕으로 정리를 해보자면, **클로저란 어떤 함수 A에서 선언한 변수 a를 참조하는 내부함수 B를 외부로 전달할 경우 A의 실행 컨텍스트가 종료된 이후에도 변수 a가 사라지지 않는 현상**을 말한다. 여기서 한가지 주의할 점은 '외부로 전달'이 곧 return만을 의마하는 것은 아니라는 점이다.

## 클로저와 메모리 관리

메모리 누수의 위험을 이유로 클로저 사용을 조심해야 한다거나 심지어 지양해야한다고 주장하는 사람들도 있지만 메모리 소모는 클로저의 본질적인 특성일 뿐이다.

> 메모리 누수 : 개발자의 의도와 달리 어떤 값의 참조 카운트가 0이 되지 않아 가비지 컬렉터의 수거 대상이 되지 않는 경우

최근의 자바스크립트 엔진에서는 발생하지 않거나 거의 발견하기 힘들어졌으므로 이제는 의도대로 설계한 '메모리 소모'에 대한 관리법만 잘 파악해서 적용하는 것으로 충분하다.

관리 방법은 간단하다. 클로저는 어떤 필요에 의해 의도적으로 함수의 지역변수를 메모리를 소모하도록 함으로써 발생한다. 그렇다면 그 필요성이 사라진 시점에는 더는 메모리를 소모하지 않게 참조 카운트를 0으로 만들면 언젠가 가비지 컬렉터가 수거해 갈 것이고, 이때 소모됐던 메모리가 회수된다.

참조 카운트를 0으로 만드는 방법은? 식별자에 참조형이 아닌 기본형 데이터(보통 null이나 undefined)를 할당하면 된다.

```javascript
// return에 의한 클로저의 메모리 해제
var outer = (function () {
  var a = 1;
  var inner = function () {
    return ++a;
  };
  return inner;
})();
console.log(outer());
console.log(outer());
outer = null; // outer 식별자의 inner 함수 참조를 끊음
```

## 클로저 활용 사례

### 5-3-1 | 콜백 함수 내부에서 외부 데이터를 사용하고자 할 때

대표적인 콜백 함수 중 하나인 이벤트 리스너에 관한 예시이다.

```javascript
var fruits = ["apple", "banana", "peach"];
var $ul = document.createElement("ul");

fruits.ForEach(function (fruit) {
  // (A)
  var $li = document.createElement("li");
  $li.innerText = fruit;
  $li.addEventListener("click", function () {
    // (B)
    alert("your choice is " + fruit);
  });
  $ul.appendChild($li);
});
document.body.appendChild($ul);
```

4번째 줄의 forEach 메서드에 넘겨준 익명의 콜백 함수(A)는 그 내부에서 외부 변수를 사용하지 않고 있으므로 클로저가 없지만, 7번째 줄의 addEventListener에 넘겨준 콜백 함수(B)에는 fruit라는 외부 변수를 참조하고 있으므로 클로저가 있다. (A)는 요소(fruit)가 꺼내질 때마다 새로운 실행 컨텍스트가 활성화된다. A의 실행 종료 여부와 무관하게 클릭 이벤트에 의해 각 컨텍스트의 (B)가 실행될 때는 (B)의 outerEnvironmentReference가 (A)의 LexicalEnvironment를 참조하게 된다. 따라서 최소한 (B) 함수가 참조할 예정인 변수 fruit에 대해서는 (A)가 종료된 후에도 GC 대상에서 제외되어 계속 참조 가능할 것이다.

그런데 (B)함수의 쓰임새가 콜백 함수에 국한되지 않는 경우라면 반복을 줄이기 위해 (B)를 외부로 분리하는 편이 나을 수 있을 것이다.

```javascript
var fruits = ["apple", "banana", "peach"];
var $ul = document.createElement("ul");

var alertFruit = function (fruit) {
  alert("your choice is " + fruit);
};
fruits.forEach(function (fruit) {
  var $li = document.createElement("li");
  $li.innerText = fruit;
  $li.addEventListener("click", alertFruit);
  $ul.appendChild($li);
});
document.body.appendChild($ul);
alertFruit(fruits[1]);
```

그런데 각 li를 클릭하면 과일명이 아닌 [object PointerEvent]라는 값이 출력된다. 콜백 함수의 인자에 대한 제어권을 addEventListener가 가진 상태이며, addEventListener는 콜백 함수를 호출할 때 첫 번째 인자에 '이벤트 객체'를 주입하기 때문이다. 이 문제는 bind 메서드를 활용하면 쉽게 해결할 수 있다.

다만 이렇게 하면 이벤트 객체가 인자로 넘어오는 순서가 바뀌는 점 및 함수 내부에서의 this가 원래의 그것과 달라지는 점은 감안해야 한다. 이런 변경사항이 발생하지 않게끔하기 위해서는 bind 메서드가 아닌 고차함수를 활용해야한다.

> 고차 함수 : 함수를 인자로 받거나 함수를 리턴하는 함수이다.

```javascript
var alertFruitBuilder = function (fruit) {
  return function () {
    alert("your choice is " + fruit);
  };
};
fruits.forEach(function (fruit) {
  var $li = document.createElement("li");
  $li.innerText = fruit;
  $li.addEventListener("click", alertFruitBuilder);
  $ul.appendChild($li);
});
document.body.appendChild($ul);
alertFruit(fruits[1]);
```

alertFruitBuilder는 내부에서 익명함수를 반환한다. 12번째 줄에서 alrtFruitBuilder 함수를 실행하면서 fruit값을 인자로 전달했다. 그러면 이 함수의 실행 결과가 다시 함수가 되며, 이렇게 반환된 함수를 리스너에 콜백 함수로써 전달할 것이다. 이후 클릭 이벤트가 발생하면 이 함수의 실행 컨텍스트가 열리면서 alertFruitBuilder의 인자로 넘어온 fruit를 outerEnvironmentReference에 의해 참조할 수 있겠쥬? 즉, **alertFruitBuilder의 실행 결과로 반환된 함수에는 클로저가 존재한다.**

### 5-3-2 | 접근 권한 제어(정보 은닉)

정보 은닉은 어떤 모듈의 내부 로직에 대해 외부로의 노출을 최소화해서 모듈간의 결합도를 낮추고 유연성을 높이고자 하는 현대 프로그래밍 언어의 중요한 개념 중 하나이다. 흔히 접근 권한에는 public, private, protected의 세 종류가 있다.

- public : 외부에서 접근 가능
- private : 내부에서만 사용하며 외부에 노출 불가
- 자바스크립트는 protected 필드를 지원하지 않지만, protected를 사용하면 편리한 점이 많기 때문에 이를 모방해서 사용하는 경우가 많다.

자바스크립트는 기본적으로 변수 자체에 이러한 접근 권한을 직접 부여하도록 설계되어있지 않다. 그렇다고 접근 권한 제어가 불가능한 것은 아니다. 클로저를 이용하면 함수 차원에서 public한 값과 private한 값을 구분하는 것이 가능하다.
