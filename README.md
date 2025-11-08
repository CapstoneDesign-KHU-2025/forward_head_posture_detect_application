# 거북목 자세교정 웹 어플리케이션

## 목차
1. [About the Project](#-about-the-project)
2. [기능 개요](#-기능-개요)
3. [기술 스택](#-기술-스택)
4. [주요 구현 내용](#-주요-구현-내용)
5. [실행 방법](#-실행-방법)
6. [프로젝트 구조](#-프로젝트-구조)
7. [팀 구성 및 역할](#-팀-구성-및-역할)

---

## About the Project
기존의 자세 교정 프로그램들은 주로 측면 촬영 기반으로 측정하기 때문에  
기기를 별도로 설치하거나 공간 세팅이 필요한 불편함이 있었다.  

본 웹 어플리케이션은 정면 웹캠 영상만으로 거북목 여부를 추정하므로,  
추가 장비 없이도 컴퓨터 작업 도중 간편하게 자세를 측정할 수 있다.  

---

## 기능 개요
- Google MediaPipe의 Pose Landmarker 모델을 사용해 실시간으로 신체 랜드마크를 추출  
- 프론트엔드(Next.js)에서 이를 분석하여 거북목 자세를 자동 판별  
- Three.js를 활용해 사용자의 평균 자세를 3D 모델로 시각화
- PostgreSQL + AWS EC2 기반 서버에서 측정 데이터를 저장 및 관리  

---

## 기술 스택
| 구분 | 기술 |
|------|------|
| **Frontend** | Next.js, React, TypeScript, TailwindCSS |
| **AI / Pose Estimation** | MediaPipe Pose Landmarker |
| **3D Visualization** | Three.js |
| **Backend / DB** | PostgreSQL, AWS EC2 |
| **Tools** | GitHub, Figma, VS Code |

---

## 주요 구현 내용
- 프론트엔드 전체 구조 및 화면 컴포넌트 설계  
- 거북목 자세 판별 알고리즘 구현  
- EC2 인스턴스 환경 구성 및 PostgreSQL 연동    
- 실시간 측정 중 시청각적 피드백 추가  

---

## 실행 방법
```bash
# Repository 클론
git clone https://github.com/CapstoneDesign-KHU-2025/forward_head_posture_detect_application.git
cd forward_head_posture_detect_application

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev
```

---

## 프로젝트 구조
추후 사진 첨부

---

## 팀 구성 및 역할
- 김가은(학번): AI, Backend
<br>[김가은 | yourname@example.com](mailto:yourname@example.com)
- 남지민(학번): Frontend
<br>[남지민 | yourname@example.com](mailto:yourname@example.com)
- 박승현(학번): Frontend(Three.js)
<br>[박승현 | yourname@example.com](mailto:yourname@example.com)
- 허준(2019102242): AI
<br>[허준 | heojun8500@naver.com](mailto:heojun8500@naver.com)

