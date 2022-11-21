# 05 클로저

## 01 클로저의 의미 및 원리 이해
클로저는 함수와 그 함수가 선언될 당시의 lexical environment의 상호관계에 따른 현상이 될 수 있다.

```
<선언될 당시의 lexical environment란?>
실행컨텍스트의 구성 요소 중 하나인 outerEnvironmentReference에 해당. 내부함수에서 외부 변수를 참조하는 경우에 한해서만 선언될 당시의 LexicalEnvironment와의 상호관계가 의미가 있다.
```

즉 클로저한 "어떤 함수에서 선언한 변수를 참조하는 내부함수에서만 발생하는 현상"이라고 볼 수 있다. 외부 함수의 변수를 참조하는 내부 함수 예제들을 통해 살펴보자.

```javascript
var outer = function(){
    var a = 1;
    var inner = function(){
        console.log(++a);
    };
    inner();
};
outer();
```

inner 함수 내부에서는 a를 선언하지 않았기 때문에 environmentRecord에서 값을 찾지 못하므로 outerEnvironmentReference에 지정된 상위 컨텍스트인 LexicalEnvironment에 접근해서 다시 a를 찾는다. 4번째 줄에서는 2가 출력된다. outer 함수의 실행 컨텍스트가 종료되면 LexicalEnvironment에 저장된 식별자들(a, inner)에 대한 참조를 지운다. 그러면 각 주소에 저장돼 있던 값들은 자신을 참조하는 변수가 하나도 없게 되므로 가비지 컬렉터의 수집 대상이 될 것이다. 내용을 조금 바꾼 예제를 살펴보자.

```javascript
var outer = function(){
    var a = 1;
    var inner = function(){
        return ++a;
    };
    return inner();
};
var outer2 = outer();
console.log(outer2);
```
6번째 줄에서는 inner 함수를 실행한 결과를 리턴하고 있으므로 결과적으로 outer 함수의 실행 컨텍스트가 종료된 시점에는 a 변수를 참조하는 대상이 없어진다. a, inner 변수의 값들은 언젠가 가비지 컬렉터에 의해 소멸할 것이다.

그렇다면 outer의 실행 컨텍스트가 종료된 후에도 inner 함수를 호출할 수 있게 만들면 어떨까?

```javascript
var outer = function(){
    var a = 1;
    var inner function(){
        return ++a
    };
    return inner;
};
var outer2 = outer();
console.log(outer2());      // 2
console.log(outer2());      // 3
```
이번에는 6번째 줄에서 `inner 함수의 실행 결과가 아닌 inner 함수 자체를 반환`했다. 그러면 outer 함수의 실행 컨텍스트가 종료되는 8번째 줄에서 outer2 변수는 outer의 실행 결과인 inner 함수를 참조한다. 이후 9번째에서 outer2를 호출하면 앞서 반환된 함수인 inner가 실행된다.

그런데 inner 함수의 실행 시점에는 outer 함수는 이미 실행이 종료된 상태인데 어떻게 outer 함수의 LexicalEnvironment에 접근가능할까?

이는 가비지컬렉터의 동작 방식 때문이다. 가비지 컬렉터는 `어떤 값을 참조하는 변수가 하나라도 있다면` 그 값은 수집 대상에 포함시키지 않는다. 따라서 지역변수를 참조하는 내부함수가 외부로 전달된 경우에 포함시키지 않는다고 볼 수 있다. 그러니까 `"어떤 함수에서 선언한 변수를 참조하는 내부함수에서만 발생하는 현상"`이란 `"외부 함수의 LexicalEnvironment가 가비지 컬렉팅되지 않는 현상"`을 말하는 것이다. 

이를 바탕으로 다시 정의해 본다면 **클로저란 어떤 함수 A에서 선언한 변수 a를 참조하는 내부함수 B를 외부로 전달할 경우 A의 실행 컨텍스트가 종료된 이후에도 변수 a가 사라지지 않는 현상**을 말한다.

## 02 클로저와 메모리 관리
**메모리누수란?**
- 개발자의 의도와 달리 어떤 값이 어디에서도 참조하지 않아 가비지 컬렉터의 수거 대상이 되지 않는경우
- 하지만 개발자가 의도적으로 참조되지 않게 설계한 경우라면 '누수'라고 할 수 없겠죠?

최근에 메모리 누수는 거의 발견하기 힘들어졌으므로 의도대로 설계한 '메모리 소모'에 대한 관리법만 잘 파악해서 적용하는 것으로 충분하다.

**그렇다면 관리방법은?**
- `필요성이 사라진 시점에 더는 메모리를 소모하지 않도록 참조 카운트를 0으로 만들어 가비지 컬렉터가 수거하도록 한다.`
- 그러면 소모됐던 메모리가 회수될 것이다.
- 참조카운트를 0으로 만드는 방법은? : 식별자에 참조형이 아닌 기본형 데이터(보통 null이나 undefined)를 할당하면 된다. 

# 03 클로저 활용 사례
실제로 어떤 상황에서 클로저가 등장하는지 살펴보자. 다양한 곳에서 광범위하게 활용되고 있다.

### 5-3-1 콜백 함수 내부에서 외부 데이터를 사용하고자 할 때
대표적 함수 중 하나인 이벤트 리스너에 관한 예시이다.
```javascript
var fruits = ['apple', 'banana', 'peach'];
var $ul = document.createElement('ul');            // 공통 코드

fruits.forEach(function (fruit) {                  // (A)
    var $li = document.createElement('li');
    $li.innerText = fruit;
    $li.addEventListener('click', function () {    // (B)
        alert('your choice is' + fruit);
    });
    $ul.appendChild($li);
});
document.body.appendChild($ul);
```
4번째 줄의 forEach 메서드에 넘겨둔 콜백함수(A)는 클로저가 없지만, 7번째 줄의 addEventListener에 넘겨준 콜백함수(B)에는 fruit라는 외부 변수를 참조하고 있으므로 클로저가 있다. (A)는 fruits의 개수만큼 실행되며, 그때마다 새로운 실행 컨텍스트가 활성화될 것이다. A의 실행 종료 여부와는 무관하게 (B)가 실행될 때는 (B)의 outerEnvironmentReference가 (A)의 LexicalEnvironment를 참조하게 될 것이다. 따라서 (B)가 참조할 변수 fruit에 대해서는 (A)가 종료된 후에도 GC대상에서도 제외된다.

그런데 (B) 함수의 쓰임새가 콜백 함수에 국한되지 않는 경우라면 반복을 줄이기 위해 (B)를 외부로 분리하는 것이 나을 수 있다. fruits를 인자로 받아 출력하는 형태로 바꿔보자.

```javascript
...
var alertFruit = function (fruit) {
    alert('your choice is' + fruit);
};
fruits.forEach(function (fruit) {                  
    var $li = document.createElement('li');
    $li.innerText = fruit;
    $li.addEventListener('click', alertFruits);
    $ul.appendChild($li);
});
document.body.appendChild($ul);
alertFruits(fruits[1]);
```
공통 함수로 쓰고자 콜백 함수를 외부로 꺼내어 alertFruits라는 변수에 담았다.
코드를 실행하면 우선 alertFruit에서 banana라는 얼럿이 실행된다. 그런데 각 li를 클릭한 대상의 과일명이 아닌 [object MouseEvent]라는 값이 출력된다. 콜백 함수의 인자에 대한 제어권을 addEventListener가 가진 상태이며, addEventListener는 콜백 함수를 호출할 때 첫 번째 인자에 '이벤트 객체'를 주입하기 때문이다. 이 문제는 bind메서드를 활용하면 손쉽게 해결할 수 있다.

다만 그렇게 하면 이벤트 객체가 인자로 넘어오는 순서가 바뀌는 점 및 함수 내부에서의 this가 원래의 그것과 달라지는 점은 감안해야 한다. 따라서 bind메서드가 아닌 고차함수를 활용해서 풀어내야한다. 

**고차함수란?**
함수를 인자로 전달받거나 함수를 결과로 반환하는 함수를 말한다. 

```javascript
...
var alertFruitBuilder = function (fruit) {
    return function () {
        alert('your choice is ' + fruit);
    };
};
fruits.forEach(function (fruit) {
    var $li = document.createElement('li')
    $li.innerText = fruit;
    $li.addEventListener('click', alertFruitBuilder(fruit));
    $ul.appendChild($li);
});
```
12번째 줄에서는 alertFruitBuilder 함수를 실행하면서 fruit 값을 인자로 전달했다. 이후 클릭 이벤트가 발생하면 비로소 이 함수의 실행 컨텍스트가 열리면서 alertFruitBuilder의 인자로 넘어온 fruit를 outerEnvironmentReference에 의해 참조할 수 있다. 즉 alertFruitBuilder의 실행 결과로 반환된 함수에는 클로저가 존재한다.

따라서 지금까지 콜백 함수 내부에서 외부변수를 참조하기 위한 방법 세 가지를 살펴봤다.
1. 콜백 함수를 내부함수로 선언해서 외부변수를 직접 참조하는 방법(클로저 사용)
2. bind 메서드로 값을 직접 넘긴 대신, 여러 제약사항 발생
3. 콜백 함수를 고차함수로 바꿔서 클로저를 적극활용한 방법

### 5-3-2 접근 권한 제어(정보 은닉)
정보 은닉이란 어떤 모듈의 내부 로직에 대해 외부로의 노출을 최소화해서 모듈간의 결합도를 낮추고 유연성을 높이고자 하는 현대 프로그래밍 언어의 중요한 개념 중 하나다. 흔히 접근 권한(객체 내부의 멤버에 대해서 외부에서 접근할 수 있는 권한 부여)에는 public, private, protected 세 종류가 있다. public은 외부에서 접근 가능한 것이고, private는 내부에서만 사용하며 외부에 노출되지 않는 것을 의미한다.

자바스크립트는 기본적으로 변수 자체에 이러한 접근 권한을 직접 부여하도록 설계돼 있지 않다. 그렇다고 접근 구너한 제어가 불가능한 것은 아니다. 클로저를 이용하면 함수 차원에서 public한 값과 private한 값을 구분하는 것이 가능하다.

```javascript
var outer = function () {
    var a =1;
    var inner = function () {
        return ++a;
    };
    return inner;
};
var outer2 = outer();
console.log(outer2());
console.log(outer2());
```
outer 함수를 종료할 때 inner 함수를 반환함으로써 outer 함수의 지역변수인 a의 값을 외부에서도 읽을 수 있게 됐다. 이처럼 클로저를 활용하면 외부 스코프에서 함수 내부의 변수들 중 선택적으로 일부의 변수에 대한 접근 권한을 부여 가능하다. return 을 활용해서 말이다. 

closure는 사전적으로 '닫혀있음, 폐쇄성, 완결성' 정도의 의미를 가진다. 이 폐쇄성에 주목해서 위 예제를 다르게 받아들일 수 있다. outer 함수는 외부(전역 스코프)로부터 철저하게 격리된 닫힌 공간이다. 외부에서는 외부 공간에 노출돼 있는 outer라는 변수를 통해 outer 함수를 실행할 수는 있지만, outer 함수 내부에는 어떠한 개입도 할 수 없다. 외부에서는 오직 outer 함수가 return한 정보에만 접근할 수 있다. return 값이 외부에 정보를 제공하는 유일한 수단인 것이다. 

그러니까 외부에 제공하고자 하는 정보들을 모아서 return 하고 내부에서만 사용할 정보들을 return 하지 않는 것으로 접근 권한 제어가 가능한 것이다. 

### 5-3-3 부분 적용 함수
부분 적용 함수란 n개의 인자를 받는 함수에 미리 m개의 인자만 넘겨 기억시켰다가, 나중에 (n-m)개의 인자를 넘기면 비로소 원래 함수의 실행 결과를 얻을 수 있게끔 하는 함수이다. this를 바인딩해야 하는 점을 제외하면 앞서 살펴본 bind 메서드의 실행 결과가 바로 부분 적용 함수이다. 

실무에서 부분 함수를 사용하기에 적합한 예로 디바운스가 있다. 디바운스는 짧은 시간 동안 동일한 이벤트가 많이 발생할 경우 이를 전부 처리하지 않고 처음 또는 마지막에 발생한 이벤트에 대해 한 번만 처리하는 것으로, 프론트엔드 성능 최적화에 큰 도움을 주는 기능 중 하나이다. 

### 5-3-4 커링 함수
커링 함수란 여러 개의 인자를 받는 함수를 하나의 인자만 받는 함수로 나눠서 순차적으로 호출될 수 있게 체인 형태로 구성한 것을 말한다. `커링은 한 번에 하나의 인자만 전달하는 것을 원칙으로 한다.` 또한 중간 과정상의 함수를 실행한 결과는 그다음 인자를 받기 위해 대기만 할 뿐으로, 마지막 인자가 전달되기 전까지는 원본 함수가 실행되지 않는다(부분 적용 함수는 여러 개의 인자를 전달할 수 있고, 실행 결과를 재실행할 때 원본 함수가 무조건 실행된다).

부분 적용 함수와 달리 커링 함수는 필요한 상황에 직접 만들어 쓰기 용이하다. 필요한 인자 개수만큼 함수를 만들어 계속 리턴해 주다가 마지막에 짠! 하고 조합해서 리턴해주면 되기 때문이다. 다만 인자가 많아질수록 가독성이 떨어진다는 단점이 있다. 

```javascript
var curry5 = func => a => b => c => d => e => func(a, b, c, d, e);
```
따라사 화살표 함수로 함수를 구현하면 코드가 짧아져 커링 함수를 이해하기 훨씬 수월하다. 화살표 순서에 따라 함수에 값을 차례로 넘겨주면 마지막에 func가 호출될 거라는 흐름이 한 눈에 파악된다. 각 단계에서 받은 인자들은 모두 마지막 단계에서 참조할 것이므로 GC되지 않고 메모리에 차곡차곡 쌓였다가, 마지막 호출로 실행 컨텍스트가 종료된 후에야 비로소 한꺼번에 GC의 수거 대상이 된다.

커링 함수는 당장 필요한 정보만 받아서 전달하고 또 필요한 정보가 들어오면 전달하는 식으로 하면 결국 마지막 인자가 넘어갈 때까지 함수 실행을 미루는 셈이 된다. 이를 함수형 프로그래밍에서는 지연실행이라고 칭한다. 원하는 시점까지 지연시켰다가 실행ㅇ하는 것이 요긴한 상황이라면 커링을 쓰기에 적합할 것이다. 혹은 프로젝트 내에서 자주 쓰이는 함수의 매개변수가 항상 비슷하고 일부만 바뀌는 경우에도 적절한 후보가 될 것이다. 

## 04 정리
클로저란 어떤 함수에서 선언한 변수를 참조하는 내부함수를 외부로 전달할 경우, 함수의 실행 컨텍스트가 종료된 후에도 해당 변수가 사라지지 않는 현상이다.

내부 함수를 외부로 전달하는 방법에는 함수를 return 하는 경우뿐 아니라 콜백으로 전달하는 경우로 포함된다. 

클로저는 그 본질이 메모리를 계속 차지하는 개념이므로 더는 사용하지 않게 된 클로저에 대해서는 메모리를 차지하지 않도록 관리해줄 필요가 있다.

클로저는 이 책에서 소개한 활용 방안 외에도 다양한 곳에서 활요할 수 있는 중요한 개념이다. 