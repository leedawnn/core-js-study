# 실행 컨텍스트

- 실행 컨텍스트는 실행할 코드에 제공할 환경 정보들을 모아놓은 객체
- 어떤 실행 컨텍스트가 활성화되는 시점에 선언된 변수를 위로 끌어올리고(호이스팅), 외부 환경 정보를 구성하고, this 값을 설정하는 등의 동작을 수행

## 01 | 실행 컨텍스트란?

_스택(stack)과 큐(queue)_

- 스택
  - 출입구가 하나뿐인 깊은 우물 같은 데이터 구조
  - 순서대로 a,b,c,d를 저장 -> 반대로 d,c,b,a 순으로 꺼낼 수 밖에 없음
- 큐
  - 양쪽이 모두 열려있느 파이프 구조. 보통 한족은 입력, 다른 한쪽은 출력만을 담당하는 구조
  - 순서대로 a, b, c, d 저장 -> a, b, c, d 순으로 꺼냄.

실행 컨텍스트: **실행할 코드에 제공할 환경 정보들을 모아놓은 객체**

동일한 환경이 있는 코드들을 실행할 때 필요한 환경 정보들을 모아 컨텍스트를 구성, 콜 스택(call stack)에 쌓아올렸다가 가장 위에 쌓여있는 컨텍스트와 관련있는 코드들을 실행하는 식으로 전체 코드의 환경과 순서를 보장.

**동일환경**: 하나의 실행 컨텍스트를 구성할 수 있는 방법.
전역공간, eval() 함수, 함수 등이 있다.

자동으로 생성되는 전역공간과 eval을 제외하면 흔히 실행 컨텍스트를 구성하는 방법은 *함수를 실행*하는 것 뿐.

_실행 컨텍스트와 콜 스택_

-콜 스택에 실행 컨텍스트가 어떤 순서로 쌓이고 어떤 순서로 코드 실행에 관여하는지?

```js
// -------------------------- (1)
var a = 1;
function outer() {
  function inner() {
    console.log(a); // undefined
    var a = 3;
  }
  inner(); // --------------- (2)
  console.log(a); // 1
}
outer(); // ----------------- (3)
console.log(a); // 1
```

> 처음 자바스크립트 코드를 실행하는 순간(1) 전역 컨텍스트가 콜 스택에 담긴다. _(최상단의 공간은 별도 실행 명령이 없어도 브라우저에서 자동으로 실행. 자바스크립트 파일이 열리는 순간 전역 컨텍스트가 활성화된다고 이해.)_
>
> (3)에서 outer 함수를 호출하면 자바스크립트 엔진은 outer에 대한 환경 정보를 수집해서 outer 실행 컨텍스트를 생성한 후 콜 스택에 담는다. 이제 콜 스택 맨 위에 outer 실행 컨텍스트가 놓인 상태가 됐으므로 전역 컨텍스트와 관련된 코드의 실행을 일시중단하고 outer 함수 내부의 코드들을 순차로 실행.
>
> (2)에서 inner 함수의 실행 컨텍스트가 콜 스택의 가장 위에 담기면 outer 컨텍스트와 관련된 코드의 실행을 중단하고 inner 함수 내부의 코드를 순서대로 진행.
> a 변수에 3을 할당하고 나면 inner 함수의 실행이 종료되면서 inner 실행 컨텍스트가 콜 스택에서 제거.
>
> 아래에 있던 outer 컨텍스트가 콜 스택의 맨 위에 존재하게 되므로 중단했던 (2)의 다음 줄부터 이어서 실행. a 변수의 값을 출력하고 나면 outer 함수의 실행이 종료되어 outer 실행 컨텍스트가 콜 스택에서 제거되고, 콜 스택에는 전역 컨텍스트만 남아 있게 된다. 실행을 중단했던 (3)의 다음 줄부터 이어서 실행하고 a 변수를 출력하고 나면 전역 공간에 실행할 코드가 남아있지 않아 전역 컨텍스트도 제거되어 콜 스택에는 아무것도 남지 않은 상태로 종료.

> **한 실행 컨텍스트가 콜 스택의 맨 위에 쌓이는 순간이 곧 현재 실행할 코드에 관여하게 되는 시점**
>
> **기존의 컨텍스트는 새로 쌓인 컨텍스트보다 아래에 위치할 수밖에 없다**
>
> **실행 컨텍스트가 활성화될 때 자바스크립트 엔진은 해당 컨텍스트에 관련된 코드들을 실행하는 데 필요한 환경 정보들을 수집해서 실행 컨텍스트 객체에 저장**
>
> - **VariableEnvironment** : 현재 컨텍스트 내의 식별자들에 대한 정보 + 외부 환경 정보. 선언 시점의 LexicalEnvironment의 스냅샷으로, 변경 사항은 반영되지 않는다.
> - **LexicalEnvironment** : 처음에는 VariableEnvironment와 같지만 변경 사항이 실시간으로 반영된다.
> - **ThisBinding** : this 식별자가 바라봐야 할 대상 객체.

## 02 | VariableEnvironment

VariableEnvironment에 담기는 내용은 LexicalEnvironment와 같지만 최초 실행 시의 스냅샷을 유지한다는 점이 다르다. 실행 컨텍스트를 생성할 때 VariableEnvironment에 정보를 먼저 담은 다음, 이를 그대로 복사해서 LexicalEnvironment를 만들고, 이후에는 LexicalEnvironment를 주로 활용.

VariableEnvironment와 LexicalEnvironment의 내부 구성.

- environmentRecord
- outer-Environment

초기화 과정 중에는 완전히 동일하고 이후 코드 진행에 따라 서로 달라지게 된다.

## 03 | LexicalEnvironment

lexical environment에 대한 한국어 번역은 문서마다 다름, '사전적인'이라는 표현이 가장 어울린다고 설명. "현재 컨텍스트의 내부에는 a, b, c와 같은 식별자들이 있고 그 외부 정보는 D를 참조하도록 구성돼있다."라는, 컨텍스트를 구성하는 환경 정보들을 사전에서 접하는 느낌으로 모아놓은 것.

### 3-1 | environmentRecord와 호이스팅

environmentRecord에는 현재 컨텍스트와 관련된 코드의 식별자 정보들이 저장. 컨텍스트 내부 전체를 처음부터 끝까지 쭉 훑어나가며 **순서대로** 수집. (수집만. 실행되기 전 상태.)

코드가 실행되기 전임에도 불구하고 자바스크립트 엔진은 이미 해당 환경에 속한 코드의 변수명들을 모두 알고 있게 되는 셈. 여기서 **호이스팅** 개념 등장.

> _호이스팅_ : 변수 정보 수집 과정의 가상 개념. 자바스크립트 엔진이 실제로 끌어올리지 않으나 편의상 끌어올린 것으로 간주하는 것.

#### **호이스팅 규칙**

environmentRecord에는 _매개변수의 이름, 함수 선언, 변수명 등이 담긴다._

?? ?? 추가 정리 필요 ?? ??

#### 함수 선언문과 함수 표현식

`함수 선언문`과 `함수 표현식` 모두 함수를 새롭게 정의할 때 쓰이는 방식인데, **함수 선언문**은 function 정의부만 존재하고 별도의 할당 명령이 없는 것을 의미, **함수 표현식**은 정의한 function을 별도의 변수에 할당하는 것을 말한다.

함수 선언문의 경우 반드시 함수명이 정의돼 있어야 하는 반면, 함수 표현식은 없어도 된다. 함수명을 정의한 함수 표현식을 '기명 함수 표현식', 정의하지 않은 것을 '익명 함수 표현식'이라고 부르기도 하는데, 일반적으로 함수 표현식은 익명 함수 표현식을 말한다.

```js
function a() {
  /* ... */
} // 함수 선언문. 함수명 a가 곧 변수명.
a(); // 실행 OK

var b = function () {
  /* ... */
}; // (익명) 함수 표현식. 변수명 b가 곧 함수명.
b(); // 실행 OK

var c = function d() {
  /* ... */
}; // 기명 함수 표현식. 변수명은 c, 함수명은 d.
c(); // 실행 OK
d(); // 에러!
```

> _함수 표현식 중 기명 함수 표현식은 외부에서 함수명으로 함수를 호출할 수 없다_

**함수 선언문과 함수 표현식의 실질적인 차이.**

```js
// 원본 코드

console.log(sum(1, 2));
console.log(multiply(3, 4));

function sum(a, b) {
  // 함수 선언문 sum
  return a + b;
}

var multiply = function (a, b) {
  // 함수 표현식 multiply
  return a * b;
};
```

```js
// 호이스팅을 마친 상태

var sum = function sum(a, b) {
  // 함수 선언문은 전체를 호이스팅
  return a + b;
};
var multiply; // 변수는 선언부만 끌어올린다
console.log(sum(1, 2));
console.log(multiply(3, 4));

multiply = function (a, b) {
  // 변수의 할당부는 원래 자리에 남겨둔다
  return a * b;
};
```

> 함수 선언문은 전체를 호이스팅한 반면 함수 표현식은 변수 선언부만 호이스팅.
> 함수도 하나의 값으로 취금할 수 있다는 것이 이런 것.
> 함수를 다른 변수에 값으로써 *할당*한 것이 `함수 표현식`
>
> _내부 코드들 차례로 실행 시_
>
> 1.  (1): 메모리 공간을 확보하고 확보된 공간의 주솟값을 변수 sum에 연결
> 2.  (4): 또 다른 메모리 공간을 확보하고 그 공간의 주솟값을 변수 multiply에 연결
> 3.  (1 - 다시): sum 함수를 또 다른 메모리 공간에 저장하고, 그 주솟값을 앞서 선언한 변수 sum의 공간에 할당. _변수 sum은 함수 sum을 바라보는 상태가 된다._
> 4.  (5): sum을 실행. 정상적으로 실행되어 3이 나온다
> 5.  (6): 현재 multiply에는 값이 할당돼 있지 않음. 비어있는 대상을 함수로 여겨 실행하라고 명령한 것. 'multiply is not function' 이라는 에러 메세지 출력. (8)은 (6)의 에러로 실행되지 않은 채 런타임 종료.

> sum 함수는 선언 전에 호출해도 아무 문제 없이 실행. 쉽게 접근할 수 있게 해주는 측면도 있지만 혼란의 원인이 되기도 한다. 아래에서 선언한 것이 위에서 문제 없이 실행되는 것이 받아들이기 어려울 수 있으나, **'선언한 후에야 호출할 수 있다'** 라는 편이 자연스러울 것!

**함수 선언 문의 위험성과 상대적으로 안전한 함수 표현식**

전역 컨텍스트가 활성화 될 때 전역공간에 선언된 함수들이 모두 가장 위로 끌어올려진다.
동일한 변수명에 서로 다른 값을 할당할 경우 나중에 할당한 값이 먼저 할당한 겂을 덮어씌운다.
코드를 실행하는 중에 실제로 호출되는 함수는 오직 마지막에 할당한 함수, 맨 마지막에 선언된 함수 뿐.

원활한 협업을 위해서는 전역공간에 함수를 선언하거나 동명의 함수를 중복 선언하는 경우는 없어야만 한다. 전역공간에 동명의 함수가 여럿 존재하는 상황이라 하더라도 모든 함수가 함수 표현식으로 정의 돼 있었다면 안전하다.

### 3-2 스코프, 스코프 체인, outerEnvironmentReference

스코프(scope)란 식별자에 대한 유효범위이다. A 내부에서 선언한 변수는 오직 A 내부에서만 접근 가능. ES5까지의 자바스크립트는 특이하게 전역공간을 제외하면 **오직 함수에 의해서만** 스코프가 생성.

이러한 '식별자의 유효범위'를 안에서 바깥으로 차례로 검색해 나가는 것을 스코프 체인이라고 한다. 이를 가능케 하는 것이 바로 LexicalEnvironment의 두번째 수집 자료인 *outerEnvironmentReference*이다.

#### 스코프 체인

outerEnvironmentReference는 현재 호출된 함수가 *선언될 당시*의 LexicalEnvironment를 참조한다. '선언될 당시'는 콜 스택 상에서 어떤 실행 컨텍스트가 활성화된 상태일 때뿐이다.

모든 코드는 실행 컨텍스트가 활성화 상태일 때 실행되기 때문이다.

outerEnvironmentReference는 연결리스트(linked list) 형태를 띤다.
'선언 시점의 LexicalEnvironment'를 계속 찾아 올라가면 마지막엔 전역 컨텍스트가 있을 것. 각 outerEnvironmentReference는 자신이 선언된 시점의 LexicalEnvironment만 참조하고 있어서 가장 가까운 요소부터 차례대로만 접근할 수 있고 다른 순서로 접근하는 것은 불가능 할 것.

여러 스코프에서 동일한 식별자를 선언한 경우, **무조건 스코프 체인 상에서 가장 먼저 발견된 식별자에만 접근 가능**

```js
var a = 1;
var outer = function () {
  var inner = function () {
    console.log(a);
    var a = 3;
  };
  inner();
  console.log(a);
};
outer();
console.log(a);
```

> '전역 컨텍스트 -> outer 컨텍스트 -> inner 컨텍스트' 순으로 점차 규모가 작아지는 반면, 스코프 체인을 타고 접근 가능한 변수의 수는 늘어난다.
>
> - 전역공간: 전역 스코프에서 생성된 변수에만 접근 가능
> - outer 함수 내부: outer 및 전역 스코프에서 생성된 변수에 접근 가능
> - inner 함수 내부: inner, outer, 전역 스코프 모두 접근 가능

스코프 체인 상에 있는 변수라고 해서 무조건 접근 가능한 것은 아니다. 위 코드 상 식별자 a는 전역 공간에서도 선언했고, 식별자 함수 내부에서도 선언 했다. 식별자 함수 내부에서 a에 접근하려고 하면 무조건 스코프 체인 상의 첫 번째 인자인 inner 스코프의 LexicalEnvironment부터 검색하고 a 식별자가 존재하므로 스코프 체인 검색을 더 진행하지 않고 즉시 inner LexicalEnvironment 상의 a를 반환.

inner 함수 내부에서 a 변수를 선언 했기 때문에 전역 공간에서 선언한 동일한 이름의 a 변수에는 접근할 수 없는 셈. 이를 **변수 은닉화**라고 한다.

#### 전역 변수와 지역 변수

- 전역변수: 전역 스코프에서 선언한 변수. (위 코드 상, 전역 스코프에서 선언한 a 와 outer)
- 지역변수: 함수 내부에서 선언한 변수. (위 코드 상, outer 함수 내부에서 선언한 inner와 inner 함수 내부에서 선언한 a)

## 04 | this

실행 컨텍스트의 thisBing에는 this로 지정된 객체가 저장. 실행 컨텍스트 활성화 당시에 this가 지정되지 않은 경우 this에는 전역 객체가 저장. 그밖에는 함수를 호출하는 방식에 따라 this에 저장되는 대상이 다르다.
