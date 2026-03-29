# login_page

Flask 项目结构已调整为按功能模块拆分：

- `app.py`：应用主入口，负责注册蓝图并在访问根路径时跳转登录页。
- `modules/auth/`：登录模块蓝图及其专属静态资源和模板。
- `modules/func/`：功能模块蓝图及其专属静态资源和模板。

## 运行

```bash
pip install flask
python app.py
```

打开 `http://127.0.0.1:5000/`，登录后会跳转到功能页面。
