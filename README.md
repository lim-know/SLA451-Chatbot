지금까지 한 거

설치
1. vscode 설치
2. python 설치
3. node.js 설치

python --version
python -m pip --version
python -m venv venv
파워쉘에서 .\venv\Scripts\Activate.ps1 (근데 방화벽 때문에 막힐 수도 있음)
cmd 에서 venv\Scripts\activate

python -m pip install fastapi uvicorn

(cd backend 로 이동 후)
uvicorn main:app --reload

deactivate

npm create vite@latest frontend