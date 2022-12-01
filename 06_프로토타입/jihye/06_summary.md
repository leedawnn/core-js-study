# 06 프로토타입
자바스크립트는 프로토타입 기반 언어이다. 클래스 기반 언어에서는 상속을 사용하지만 `프로토타입 기반 언어에서는 어떤 객체를 원형으로 삼고 이를 복제(참조)함으로써 상속과 비슷한 효과`를 얻는다. 

**프로토타입 언어란? =>** 프로토타입 기반 언어는 클래스 기반 언어에서 상속을 사용하는 것과는 다르게, 객체를 원형(프로토타입)으로 하는 복제 과정을 통해 객체의 동작 방식을 재사용 할 수 있게 한다.

## 01 프로토타입의 개념 이해

### 6-1-1 constructor, prototype, instance
```javascript
var instance = new Constructor();
```
- 어떤 생성자 함수를 new 연산자와 함께 호출하면
- Constructor에서 정의된 내용을 바탕으로 새로운 인스턴스가 생성된다.
- 이때 instance에는 __proto__라는 프로퍼티가 자동으로 부여되는데,
- 이 프로퍼티는 Constructor의 prototype이라는 프로퍼티를 참조한다.

prototype이라는 프로퍼티와 __ proto __ 라는 프로퍼티가 새로 등장했는데, 이 둘의 관계가 프로토타입 개념의 핵심이다. prototype은 객체이다. 이를 참조하는 __ proto __ 역시 당연히 객체다. prototype 객체 내부에는 인스턴스가 사용할 메서드를 저장한다. `그러면 인스턴스에서도 숨겨진 프로퍼티인 __ proto __를 통해 이 메서드들에 접근할 수 있게 된다.` 

예를 들어, Person이라는 생성자 함수의 prototype에 getName이라는 메서드를 지정했다고 해보자.
```javascript
var Person = function (name) {
    this._name = name;
};
Person.prototype.getName = function() {
    return this._name;
}
```
이제 Person의 인스턴스는 __ proto __ 프로퍼티를 통해 getName을 호출할 수 있다. 

```javascript
var suzi = new Person('Suzi');
suzi.__proto__.getName();   // undefined
```
왜냐하면 instance의 __ proto __가 Constructor의 prototype 프로퍼티를 참조하므로 결국 둘은 같은 객체를 바라보기 때문이다.

```javascript
Person.prototype === suzi.__proto__ // true
```

메서드 호출 결과로 undefined가 나온 점에 주목하자. 어떤 변수를 실행해 undefined가 나왔다는 것은 이 변수가 '호출할 수 있는 함수'에 해당한다는 것을 의미한다. 만약 실행할 수 없는, 즉 함수가 아닌 데이터 타입이었다면 TypeError가 발생했을 것이다. 그런데 값이 에러가 아닌 다른 값이 나왔으니까 getName이 실제로 실행됐음을 알 수 있고, 이로부터 getName이 함수라는 것이 입증됐다.

다음으로 함수 내부에서 어떤 값을 반환하는지를 살펴볼 차례다. this.name 값을 리턴하는 내용으로 구성되어 있다. 결론적으로 문제는 바로 this에 바인딩된 대상이 잘못 지정되었다는 것이다.

어떤 함수를 '메서드로서' 호출할 때는 메서드명 바로 앞의 객체가 곧 this가 된다고 했다. 따라서 이 객체 내부에는 name 프로퍼티가 없으므로 '찾고자 하는 식별자가 정의돼 있지 않을 때는 Error 대신 undefined를 반환한다' 라는 자바스크립트 규약에 의해 undefined가 반환된 것이다.

그래서 --proto 객체에 name 프로퍼티가 있다면 예상대로 SUZY--proto--가 잘 출력된다. `그러니 관건은 this이다. this를 인스턴스로 할 수 있으면 좋겠다. 그 방법은 --proto-- 없이 인스턴스에서 곧바로 메서드를 쓰는 것이다.`
```javascript
var suzi = new Person('suzy', 28);
suzi.getName(); // suzi
var iu = new Person('jieun', 28);
iu.getName();   // jieun
```
--proto--를 빼면 this는 instance가 되는 게 맞지만, 이대로 메서드가 호출되고 심지어 원하는 값이 나오는 것은 좀 이상하다. 그 이유가 바로 `--proto--가 **생략 가능**한 프로퍼티이기 때문이다. 원래부터 그렇게 정의되어 있으므로 생략 가능하다는 점만 기억하자.

```javascript
suzi.__proto__.getName  
-> suzy(.__proto__).getName
-> suzi.getName
```
--proto--를 생략하지 않으면 this는 suzy.--proto--를 가리키지만, 이를 생략하면 suzi를 가리킨다. suzi.--proto-- 에 있는 메서드인 getName을 실행하지만 this는 suzi를 바라보게 할 수 있게 된 것이다. 

한 문장으로 설명하자면 `"new 연산자로 Constructor를 호출하면 instance가 만들어지는데, 이 instance의 생략 가능한 프로퍼티인 --proto--는 Constructor의 prototype을 참조한다!"` 라고 프로퍼티를 이해할 수 있다.

프로트타입의 개념을 좀 더 상세히 설명하자면 **생성자 함수의 prototype에 어떤 메서드나 프로퍼티가 있다면 인스턴스에서도 마치 자신의 것처럼 해당 메서드나 프로퍼티에 접근할 수 있게 된다.**

### 6-1-2 constructor 프로퍼티
생성자 함수의 프로퍼티인 prototype 객체 내부와 인스턴스의 --proto-- 객체 내부엔 constructor라는 프로퍼티가 있다. 이 프로퍼티는 단어 그대로 원래의 생성자 함수(자기 자신)를 참조한다. 자신을 참조하는 프로퍼티를 굳이 뭐하러 가지고 있을까 싶지만, 이 역시 인스턴스와의 관계에 있어서 필요한 정보이다. 인스턴스로부터 그원형이 무엇인지를 알 수 있는 수단이기 때문이다.

constructor를 변경하더라도 참조하는 대상이 변경될 뿐 이미 만들어진 인스턴스의 원형이 바뀐다거나 데이터 타입이 변하는 것은 아니다. 즉 어떤 인스턴스의 생성자 정보를 알아내기 위해 constructor 프로퍼티에 의존하는 게 항상 안전하지는 않은 것이다.

## 02 프로토타입 체인
### 6-2-1 메서드 오버라이드
prototype 객체를 참조하는 --proto-- 를 생략하면 인스턴스는 prototype에 정의된 프로퍼티나 메서드를 마치 자신의 것처럼 사용할 수 있다고 했다. 그런데 만약 인스턴스가 동일한 이름의 프로퍼티 또는 메서드를 가지고 있는 상황이라면 어떨까?

```javascript
var Person = function (name) {
    this.name = name;
};
Person.prototype.getName = function () {
    return this.name;
};

var iu = new Person('지금');
iu.getName = function () {
    return '바로' + this.name;
};
console.log(iu,getName());      // 바로 지금
```

iu.--proto--.getName이 아닌 iu 객체에 있는 getName 메서드가 호출됐다. 여기서 일어난 현상을 메서드 오버라이드라고 한다. 메서드 위에 메서드를 덮어씌웠다는 표현이다. 원본을 제거하고 다른 대상으로 교체하는 것이 아니라 원본이 그대로 있는 상태에서 다른 대상을 그 위에 얹는 이미지를 떠올리면 정확하다. 그렇다면 메서드 오바러이딩이 이뤄져 있는 상황에서 prototype에 있는 메서드에 접근하려면 어떻게 해야 할까?

```javascript
console.log(iu.__proto__.getName());    // undefined
```
this가 prototype 객체(iu.--proto--)를 가리키는데 prototype 상에는 name 프로퍼티가 없기 때문에 undefined가 출력됐다. 만약 prototype에 name 프로퍼티가 있다면 그 값이 출력될 것이다.

```javascript
Person.prototype.name = '이지금';
console.lof(iu.__proto__.getName());    // 이지금
```
원하는 메서드(prototype에 있는 getName)가 호출되고 있다는 게 확실해졌다. 다만 this가 prototype을 바라보고 있는데 이걸 인스턴스를 바라보도록 바꿔주면 된다. call이나 apply로 해결 가능할 것 같다.

```javascript
console.log(iu.__proto__.getName.call(iu));     // 지금
```
드디어 성공이다. 즉 일반적으로 메서드가 오버라이드된 경우에는 자신으로부터 가장 가까운 메서드에만 접근할 수 있지만, 그다음으로 가까운 --proto--의 메서드도 우회적인 방법을 통해서이긴 하지만 접근이 불가능한 것은 아니다.

### 6-2-2 프로토타입 체인
프로토타입 체인을 설명하기에 앞서 이번에는 객체의 내부 구조를 살펴보자.
```javascript
console.dir({a: 1});
```

객체의 내 구를 살펴보면 배열 리터럴의 --proto--안에는 또다시 --proto--가 등장한다. 왜 그럴까? 바로 prototype 객체가 '객체'이기 때문이다. 기본적으로 모든 객체의 --proto--에는 Object.prototype이 연결된다. prototype 객체도 예외가 아니다. 이를 그림으로 표현하면 다음과 같다. 

--proto--는 생략 가능하다고 했다. 그렇기 떄문에 배열이 Array.prototype 내부의 메서드를 마치 자신의 것처럼 실행할 수 있었다. 마찬가지로 Object.prototype 내부의 메서드도 자신의 것처럼 실행할 수 있다. 생략 가능한 --proto--를 한 번 더 따라가면 Object.prototype을 참조할 수 있기 때문이다. 

어떤 데이터의 --proto-- 프로퍼티 내부에 다시 --proto-- 프로퍼티가 연쇄적으로 이어진 것을 프로토타입 체인이라 하고, 이 체인을 따라가며 검색하는 것을 프로토타입 체이닝이라고 한다. 프로토타입 체이닝은 메서드 오버라이드와 동일한 맥라이다. 

```javascript
var arr = [1, 2];
Array.prototype.toString.call(arr);  // 1. 2
Object.prototype.toString.call(arr); // [Object Array]
arr.toString();                      // 1, 2

arr.toString = function () {
    return this.join('_');
};
arr.toString();                      // 1_2
```

### 6-2-3 객체 전용 메서드의 예외사항
어떤 생성자 함수이든 prototype은 반드시 객체이기 때문에 Object.prototype이 언제나 프로토타입 체인의 최상단에 존재하게 된다. 따라서 객체에서만 사용할 메서드는 다른 여느 데이터 타입처럼 프로토타입 객체 안에 정의할 수가 없다. 

### 6-2-4 다중 프로토타입 체인
자바스크립트의 기본 내장 데이터 타입들은 모두 프로토타입 체인이 1단계(객체)이거나 2단계(나머지)로 끝나는 경우만 있었지만 사용자가 새롭게 만드는 경우에는 그 이상도 얼마든지 가능하다. 대각선의 --proto--를 연결해나가기만 하면 무한대로 체인 관계를 이어나갈 수 있다. 

대각선의 --proto--를 연결하는 방법은 --proto--가 가리키는 대상, 즉 생성자 함수의 prototype이 연결하고자 하는 상위 새엇ㅇ자 함수의 인스턴스를 바라보게끔 해주면 된다. 말로 설명하기 어려우니 예제를 보자.
```javascript
var Crade = function () {
    var args = Array.prototype.slice.call(arguments);
    for (var i = 0; i < args.length; i++){
        this[i] = args[i];
    }
    this.length = args.length;
};
var g = new Grade(100, 80);
```
변수 g는 Grade의 인스턴스를 바라본다. Grade의 인스턴스는 유사배열객체이다. 유사배열객체에 배열 메서드를 적용하는 방법으로 call/apply를 소개했지만, 이번에는 인스턴스에서 배열 메서드를 직접 쓸 수 있게끔 하고 싶다. 그러기 위해서는 g.--proto--, 즉 Grade.prototype이 배열의 인스턴스를 바라보게 하면 된다. 

```javascript
Grade.prototype = [];
```
이 명령에 의해 서로 별개로 분리돼 있던 데이터가 연결되어 하나의 프로토타입 체인 형태를 띄게 된다. 이제는 Grade의 인스턴스인 g에서 직접 배열의 메서드를 사용할 수 있다. 

g 인스턴스의 입장에서는 프로토타입 체인에 따라 g 객체 자신이 지니는 멤버, Grade의 prototype에 있는 멤버, Array.prototype에 있는 멤버, 끝으로 Object.prototype에 있는 멤버에까지 접근할 수 있게 됐다.

## 03 정리
어떤 생성자 함수를 new 연산자와 함께 호출하면 Constructor에서 정의된 내용을 바탕으로 새로운 인스턴스가 생성되는데, 이 인스턴스에는 --proto--라는, Constructor의 prototype 프로퍼티를 참조하는 프로퍼티가 자동으로 부여된다. --proto--는 생략 가능한 속성이라서, 인스턴스는 Constructor.prototype의 메서드를 마치 자신의 메서드인 것처럼 호출할 수 있다. 

Constructor.prototype에는 constructor라는 프로퍼티가 있는데, 이는 다시 생성자 함수 자신을 가리킨다. 이 프로퍼티는 인스턴스가 자신의 생성자 함수가 무엇인지를 알고자 할 때 필요한 수단이다. 

직각삼각형의 대각선 방향, 즉 --proto-- 방향을 계속 찾아가면 최종적으로 Object.prototype에 당도하게 된다. 이런 식으로 --proto--안에 다시 --proto--를 찾아가는 과정을 프로토타입 체이닝이라고 하며, 이 프로토타입 체이닝을 통해 각 프로토타입 메서드를 자신의 것처럼 호출할 수 있다. 이때 접근 방식은 자신으로부터 가장 가까운 대상부터 점차 먼 대상으로 나아가며, 우너하는 값을 찾으면 검색을 중단한다.

Object.prototype에는 모든 데이터 타입에서 사용할 수 있는 범용적인 메서드만이 존재하며, 객체 전용 메서드는 여느 데이터 타입과 달리 Object 생성자 함수에 스태택하게 담겨있다. 

프로토타입 체인은 반드시 2단계로만 이뤄지는 것이 아니라 무한대의 단계를 생성할 수도 있다. 