function main() {
    var modal = document.querySelector('.modal');
    var loginBtn = document.querySelector('.login-btn');

    loginBtn.addEventListener('click',() => {
        modal.classList.add('open');
    });

    var closeElement = document.querySelector('.modal-close i');
    closeElement.onclick = () => {
        modal.classList.remove('open');
    }
}

main();

function Validator(options) {
    var formElement = document.querySelector(options.form);
    var selectorRules = {};

    function getParent(element, selector) {
        while(element.parentElement) {
            if(element.parentElement.matches(selector)) {
                return element.parentElement;
            }

            element = element.parentElement;
        }
    }

    function validate(inputElement, rule) {
        var errorMessage;

        //Lấy ra các rule của thẻ input
        var rules = selectorRules[rule.selector];
        
        //lặp qua từng rule và kiểm tra
        //Neeuwss có lỗi thì dừng lại và trả về lỗi
        for(var i = 0; i < rules.length; ++i) {
            errorMessage = rules[i](inputElement.value);
            if (errorMessage) break;
        }

        var errorElement = getParent(inputElement, options.formGroupSelector).querySelector('.form-message');

        if(errorMessage) {
            errorElement.innerText = errorMessage;
            getParent(inputElement, options.formGroupSelector).classList.add('invalid');
        } else {
            errorElement.innerText = "";
            getParent(inputElement, options.formGroupSelector).classList.remove('invalid');
        }

        return !errorMessage;
    }

    if(formElement) {
        // Xử lý sự kiện khi người dùng ấn submit
        formElement.onsubmit = (event) => {
            event.preventDefault();

            var isFormValid = true;

            options.rules.forEach((rule) => {
                var inputElement = formElement.querySelector(rule.selector);

                if(inputElement) {
                    var isValid = validate(inputElement, rule);
                    if(!isValid) {
                        isFormValid = false;
                    }
                }
            });

            if(isFormValid) {
                if(typeof options.onSubmit === 'function') {
                    var enableInputs = formElement.querySelectorAll('input[name]:not([disabled])');

                    var formValues = Array.from(enableInputs).reduce((values, input) => {
                        values[input.name] = input.value;
                        return values;
                    },{});

                    options.onSubmit(formValues);
                }
            }
        }
        //Xử lý lặp qua mỗi thẻ input
        options.rules.forEach((rule) => {
            if(Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test);
            } else {
                selectorRules[rule.selector] = [rule.test];
            }

            var inputElements = formElement.querySelectorAll(rule.selector);
            Array.from(inputElements).forEach((inputElement) => {

                // Xử lý khi người dùng blur ra khỏi ô input
                inputElement.onblur = () => {
                    validate(inputElement, rule);
                }

                // Xử lý khi người dùng bắt đầu nhập vào
                inputElement.oninput = () => {
                    var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector);
                    errorElement.innerText = "";
                    getParent(inputElement, options.formGroupSelector).classList.remove('invalid');
                }
            });
            
        });
    }

}

Validator.isRequired = (selector, message) => {
    return {
        selector,
        test: (value) => {
            return value ? undefined : message || 'Vui lòng nhập trường này!';
        }
    }
}

Validator.minLength = function (selector, min, message) {
    return {
        selector,
        test: (value) => {
            return value.length >= min ? undefined : message || `Vui lòng nhập tối thiểu ${min} ký tự`;
        }
    }
}