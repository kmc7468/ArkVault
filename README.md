# ArkVault

안전한 미디어 관리 시스템

**경고!** 아직 활발히 개발 중인 프로젝트예요. 모든 기능이 구현된 것이 아니며, 불안정할 수 있어요.

## Features

- 🔒 사용자의 미디어는 클라이언트에서 암호화한 상태로 저장돼요.
- 🔑 메타 데이터도 클라이언트에서 암호화돼요.
  - ⚠️ 검색의 용이성을 위해, 스키마는 암호화되지 않아요.
  - ⚠️ 파일의 MIME 타입과 같은 일부 메타 데이터는 암호화되지 않아요.
- 📱 여러 디바이스에서 동시에 접근할 수 있어요.

## How to Install

제공되는 Dockerfile과 docker-compose.yaml 파일의 사용을 권장해요.

```bash
git clone https://github.com/kmc7468/arkvault -b main
cd arkvault
vim .env # 아래를 참고하여 환경 변수를 설정해 주세요.
docker compose up --build -d
```

모든 데이터는 `./data` 디렉터리에 아래에 저장될 거예요.

### Environment Variables

필수 환경 변수가 아닌 경우, 설정해야 하는 특별한 이유가 없다면 기본값을 사용하는 것이 좋아요.

|이름|필수|기본값|설명|
|:-|:-:|:-:|:-|
|`DATABASE_PASSWORD`|Y||데이터베이스에 접근하기 위해 필요한 비밀번호예요. 안전한 값으로 설정해 주세요.|
|`SESSION_SECRET`|Y||Session ID의 서명에 사용되는 비밀번호예요. 안전한 값으로 설정해 주세요.|
|`SESSION_EXPIRES`||`14d`|Session의 유효 시간이에요. Session은 마지막으로 사용된 후 설정된 유효 시간이 지나면 자동으로 삭제돼요.|
|`USER_CLIENT_CHALLENGE_EXPIRES`||`5m`|암호 키를 서버에 처음 등록할 때 사용되는 챌린지의 유효 시간이에요.|
|`SESSION_UPGRADE_CHALLENGE_EXPIRES`||`5m`|암호 키와 함께 로그인할 때 사용되는 챌린지의 유효 시간이에요.|
|`TRUST_PROXY`|||신뢰할 수 있는 리버스 프록시의 수예요. 설정할 경우 1 이상의 정수로 설정해 주세요. 프록시에서 `X-Forwarded-For` HTTP 헤더를 올바르게 설정하도록 구성해 주세요.|
|`NODE_ENV`||`production`|ArkVault의 사용 용도예요. `production`인 경우, 컨테이너가 실행될 때마다 DB 마이그레이션이 자동으로 실행돼요.|
|`PORT`||`80`|ArkVault 서버의 포트예요.|
|`CONTAINER_UID`||`0`|Docker 컨테이너에 매핑할 UID예요. NFS와 함께 사용할 경우 설정이 필요할 수 있어요.|
|`CONTAINER_GID`||`0`|Docker 컨테이너에 매핑할 GID예요. NFS와 함께 사용할 경우 설정이 필요할 수 있어요.|
